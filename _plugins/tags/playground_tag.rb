# frozen_string_literal: true

require_relative "./../helpers/svg_helper"
require "cgi"

module Jekyll
  class PlaygroundTag < Liquid::Tag
    include SvgHelper

    def initialize(tag_name, text, tokens)
      super
      @params = parse_params(text)
    end

    def parse_params(text)
      Hash[text.scan(/(\w+):["']([^"']+)["']/)]
    end

    def render(context)
      site = context.registers[:site]
      playgrounds = site.data["playgrounds"] || {}
      id = @params["id"]
      autorun = @params.fetch("autorun", "true")
      line_numbers = @params.fetch("line_numbers", "off")

      playground = playgrounds[id]

      return "<!-- Playground not found: #{id} -->" unless playground

      name = playground["name"] || "Playground"
      url = playground["url"]

      <<~HTML
        <section id="pg-#{id}" class="playground" aria-label="Code playground: #{name}"
                 data-playground data-id="#{id}" data-autorun="#{autorun}" data-line-numbers="#{line_numbers}">
          #{render_header(playground, context, id, name, url)}
          #{render_main_content(playground, context, id, name, autorun)}
          #{render_footer(id)}
        </section>
      HTML
    end

    private

    def render_header(playground, context, id, name, url)
      <<~HTML
        <header class="playground-header">
          <div class="playground-brand">
            <div class="window-controls" aria-hidden="true">
              <span class="window-btn close">#{inline_svg(context, "circle-fill.svg")}</span>
              <span class="window-btn minimize">#{inline_svg(context, "circle-fill.svg")}</span>
              <span class="window-btn maximize">#{inline_svg(context, "circle-fill.svg")}</span>
            </div>

            <h3 class="playground-title" id="pg-title-#{id}">
              <span class="visually-hidden">Playground name:</span>
              <span class="playground-name">#{name}</span>
            </h3>
          </div>

          <nav class="playground-toolbar" aria-label="Playground actions">
            <button class="btn btn-sm" data-action="toggleLineNumbers" aria-label="Toggle line numbers">
              #{inline_svg(context, "hash.svg")}
            </button>
            <button class="btn btn-sm" data-action="reset" aria-label="Reset playground">
              #{inline_svg(context, "skip-back.svg")}
            </button>
            <button class="btn btn-sm" data-action="beautify" aria-label="Beautify code">
              #{inline_svg(context, "magic-wand.svg")}
            </button>
            <button class="btn btn-sm" data-action="export" aria-label="Export code">
              #{inline_svg(context, "download.svg")}
            </button>
            #{render_url_button(context, url)}
          </nav>
        </header>
      HTML
    end

    def render_url_button(context, url)
      return "" unless url
      <<~HTML
        <button class="btn btn-sm" aria-label="Open playground in CodePen"
                onclick="window.open('#{url}', '_blank')" rel="noopener">
          #{inline_svg(context, "external-link.svg")}
        </button>
      HTML
    end

    def render_main_content(playground, context, id, name, autorun)
      <<~HTML
        <div class="playground-content" data-split-pane role="group" aria-label="Playground workspace">
          <!-- Editor Section -->
          <section class="editor-section" data-pane="left" role="region" aria-label="Code Editors">
            <div class="tabs editor-tabs" role="tablist" aria-label="Editor Tabs">
              #{render_editor_tabs(playground, id)}
            </div>

            <div class="editor-panels">
              #{render_editor_panels(playground, context, id)}
            </div>
          </section>

          <!-- Split Handle -->
          <button class="split-handle" tabindex="0" aria-label="Resize panels" data-split-handle>
            <span class="visually-hidden">Use left/right arrows to resize editor and preview panels</span>
          </button>

          <!-- Preview Section -->
          <section class="preview-section" data-pane="right" role="region" aria-label="Preview and Console">
            <div class="tabs preview-tabs" role="tablist" aria-label="Preview Tabs">
              <button class="tab preview-tab" id="preview-result-tab-#{id}" role="tab"
                      aria-controls="preview-result-panel-#{id}" aria-selected="true" data-preview="result">
                Result
              </button>
              <button class="tab preview-tab" id="preview-console-tab-#{id}" role="tab"
                      aria-controls="preview-console-panel-#{id}" aria-selected="false" data-preview="console">
                Console
              </button>
            </div>

            <div class="preview-panels">
              #{render_result_panel(context, id, name, autorun)}
              #{render_console_panel(context, id)}
            </div>
          </section>
        </div>
      HTML
    end

    def render_editor_tabs(playground, id)
      playground["files"].each_with_index.map do |file, idx|
        tab_id = "tab-#{id}-#{file['type']}-#{idx}"
        panel_id = "panel-#{id}-#{file['type']}-#{idx}"
        <<~HTML
          <button id="#{tab_id}" class="tab editor-tab" role="tab" data-editor="#{file['type']}-#{idx}"
                  data-file-index="#{idx}" aria-selected="#{idx.zero?}" aria-controls="#{panel_id}">
            #{file["name"]}
          </button>
        HTML
      end.join("\n")
    end

    def render_editor_panels(playground, context, id)
      playground["files"].each_with_index.map do |file, idx|
        tab_id = "tab-#{id}-#{file['type']}-#{idx}"
        panel_id = "panel-#{id}-#{file['type']}-#{idx}"
        <<~HTML
          <div class="editor-panel" id="#{panel_id}" role="tabpanel" aria-labelledby="#{tab_id}"
               aria-hidden="#{!idx.zero?}" data-file-type="#{file['type']}" data-file-index="#{idx}"
               data-editor-panel="#{file['type']}-#{idx}">
            <div class="editor-header">
              <button class="btn btn-sm" data-copy-target="#code-#{id}-#{file['type']}-#{idx}" aria-label="Copy code from #{file['name']}">
                #{inline_svg(context, "clipboard-check.svg")}
              </button>
            </div>
            <div class="code-editor">
              <div class="editor-gutters">
                <div class="editor-gutter editor-lines"></div>
                <div class="editor-gutter editor-folds"></div>
              </div>
              <div id="code-#{id}-#{file['type']}-#{idx}" contenteditable="true" spellcheck="false" autocorrect="off" autocapitalize="off" writingsuggestions="false" translate="no" role="textbox" aria-label="Code editor for #{file["name"]}" aria-multiline="true" aria-describedby="pg-title-#{id}">#{CGI.escapeHTML(file["code"]).strip}</div>
            </div>
            <div class="editor-footer">
              <div class="caret-metadata" role="status" aria-live="polite" aria-atomic="true"
                   aria-label="Caret position and selection details"></div>
            </div>
          </div>
        HTML
      end.join("\n")
    end

    def render_result_panel(context, id, name, autorun)
      checked_attr = autorun == "true" ? "checked" : ""
      <<~HTML
        <div class="preview-panel" id="preview-result-panel-#{id}" data-preview-panel="result"
             role="tabpanel" aria-labelledby="preview-result-tab-#{id}" aria-hidden="false">
          <div class="preview-header">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="autorun-check-#{id}" data-action="autorun" #{checked_attr}>
              <label class="form-check-label autorun-check-label" for="autorun-check-#{id}">Auto-run</label>
            </div>
            <button class="btn btn-sm" data-action="run" aria-label="Run code">
              #{inline_svg(context, "refresh.svg")}
            </button>
          </div>
          <iframe class="preview-frame" title="Result output of #{name}" sandbox="allow-scripts allow-same-origin"></iframe>
          <div class="preview-footer">
            <div class="render-metadata" role="status" aria-live="polite" aria-atomic="true" aria-label="Preview render details including size, render time, and theme"></div>
          </div>
        </div>
      HTML
    end

    def render_console_panel(context, id)
      <<~HTML
        <div class="preview-panel" id="preview-console-panel-#{id}" data-preview-panel="console"
             role="tabpanel" aria-labelledby="preview-console-tab-#{id}" aria-hidden="true">
          <div class="console-header">
            <button class="btn btn-sm" data-action="clearConsole"
                    aria-label="Clear console output">
              #{inline_svg(context, "circle-slash.svg")}
            </button>
          </div>
          <div class="console-output" data-console-panel></div>
          <div class="console-footer">
            <div class="console-metadata" role="group" aria-label="Console message counts">
              #{render_console_log_counts}
            </div>
          </div>
        </div>
      HTML
    end

    def render_footer(id)
      <<~HTML
        <footer class="playground-footer" aria-label="Playground status information">
          <div class="playground-note">
            This playground is under active development. Some features may be incomplete or behave unexpectedly.
            If you notice any bugs or unexpected behavior, please <a href="/contact">let me know</a>!.
          </div>
        </footer>
      HTML
    end

    def render_console_log_counts
      %w[log info debug warn error].map do |level|
        <<~HTML
          <span class="console-count-#{level}" data-level="#{level}" title="#{level.capitalize} count">
            #{level.capitalize} <span class="count">0</span>
          </span>
        HTML
      end.join("\n")
    end
  end
end

Liquid::Template.register_tag("playground", Jekyll::PlaygroundTag)
