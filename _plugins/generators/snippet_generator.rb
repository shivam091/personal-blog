# frozen_string_literal: true

require_relative "./../helpers/logger_helper"

module Jekyll
  class SnippetPage < Page
    def initialize(site, base, dir, snippet_doc, prev_snippet, next_snippet)
      @site = site
      @base = base
      @dir  = dir
      @name = "index.html"

      self.process(@name)
      self.read_yaml(File.join(base, "_layouts"), "snippet.html")

      # 1. Prepare Liquid Context (This allows custom tags to work)
      payload = site.site_payload
      payload["page"] = snippet_doc.data

      # 2. Render Liquid first
      liquid_content = site.liquid_renderer.file(snippet_doc.path).parse(snippet_doc.content).render!(
        payload,
        { registers: { site: site, page: self.data } }
      )

      # 3. Convert the resulting Markdown to HTML
      markdown_converter = site.find_converter_instance(Jekyll::Converters::Markdown)
      self.content = markdown_converter.convert(liquid_content)

      # 4. Merge metadata
      self.data.merge!(snippet_doc.data)
      self.data.merge!(
        "layout"      => "snippet",
        "title"       => snippet_doc.data["title"] || snippet_doc.basename_without_ext,
        "previous"    => prev_snippet,
        "next"        => next_snippet,
        "permalink"   => "/snippet/#{snippet_doc.basename_without_ext}"
      )
    end
  end

  class SnippetGenerator < Generator
    include LoggerHelper

    safe true
    priority :low

    def generate(site)
      return unless site.collections.key?("snippets")

      info("▶ SnippetGenerator:", "Parsing snippets with Liquid support")

      # Sorting: respects 'order' then falls back to date
      snippets = site.collections["snippets"].docs.sort_by do |doc|
        [doc.data["order"] || 9999, doc.date || Time.now]
      end

      total = snippets.size
      snippets.each_with_index do |snippet, index|
        prev_snippet = index > 0 ? nav_info(snippets[index - 1]) : nil
        next_snippet = index < total - 1 ? nav_info(snippets[index + 1]) : nil

        dir = File.join("snippets", snippet.basename_without_ext)
        page = SnippetPage.new(site, site.source, dir, snippet, prev_snippet, next_snippet)

        site.pages << page
      end
    end

    private

    def nav_info(doc)
      {
        "url"   => "/snippet/#{doc.basename_without_ext}",
        "title" => doc.data["title"] || doc.basename_without_ext
      }
    end
  end
end
