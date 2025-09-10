# frozen_string_literal: true

require_relative "./../helpers/svg_helper"

module Jekyll
  class DetailsTag < Liquid::Block
    include SvgHelper

    SYNTAX = /summary="(.*?)"/

    def initialize(tag_name, markup, tokens)
      super
      if markup.strip =~ SYNTAX
        @summary = Regexp.last_match(1)
      else
        raise SyntaxError.new("Syntax Error in 'details' - Valid syntax: details summary=\"Text\"")
      end
    end

    def render(context)
      site = context.registers[:site]

      summary_resolved = Liquid::Template.parse(@summary).render(context)

      summary_html = Kramdown::Document.new(summary_resolved).to_html_extended
      content_html = Kramdown::Document.new(super.strip).to_html_extended

      <<~HTML
        <details>
          <summary>
            #{inline_svg(context, "flat.svg")}
            #{summary_html}
          </summary>
          #{content_html}
        </details>
      HTML
    end
  end
end

Liquid::Template.register_tag("details", Jekyll::DetailsTag)
