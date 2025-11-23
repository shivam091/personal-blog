# frozen_string_literal: true

require_relative "./../filters/language_label_filter"
require_relative "./../filters/regex_filters"
require_relative "./../helpers/svg_helper"

module Jekyll
  class CodeblockBlock < Liquid::Block
    include RegexFilters, LanguageLabelFilter, SvgHelper

    def render(context)
      highlighted_code = super.strip
      lang_label = detected_language(highlighted_code)

      <<~HTML
        <div class="code-block" data-copy-code>
          <div class="code-block-header" role="region" aria-labelledby="code-lang-label">
            <div class="code-block-button-group" aria-hidden="true">
              <span class="code-block-action code-close">
                #{inline_svg(context, "circle-fill.svg")}
              </span>
              <span class="code-block-action code-minimize">
                #{inline_svg(context, "circle-fill.svg")}
              </span>
              <span class="code-block-action code-maximize">
                #{inline_svg(context, "circle-fill.svg")}
              </span>
            </div>
            <div class="code-lang" id="code-lang-label">
              #{inline_svg(context, "code.svg")}
              <span class="visually-hidden">Code language:</span>
              #{lang_label}
            </div>
            <div class="code-actions">
              <button type="button" class="btn btn-sm btn-secondary btn-toggle-lines" aria-label="Toggle line numbers" data-tooltip="Toggle line numbers" data-action="toggleLineNumbers">
                #{inline_svg(context, "hash.svg")}
              </button>
              <button type="button" class="btn btn-sm btn-secondary btn-copy" aria-label="Copy code" data-tooltip="Copy">
                #{inline_svg(context, "clipboard-check.svg")}
              </button>
            </div>
          </div>
          #{highlighted_code}
        </div>
      HTML
    end
  end
end

Liquid::Template.register_tag("codeblock", Jekyll::CodeblockBlock)
