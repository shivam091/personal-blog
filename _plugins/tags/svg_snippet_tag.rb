# frozen_string_literal: true

module Jekyll
  class SvgSnippetTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @svg_data_path = markup.strip
    end

    def render(context)
      site = context.registers[:site]
      
      # 1. Fetch SVG content from Jekyll Data (e.g., site.data.vectors.my_icon)
      # This handles nested paths like 'icons.social.github'
      svg_code = @svg_data_path.split(".").inject(site.data) { |hash, key| hash[key] if hash }

      if svg_code.nil?
        return ""
      end

      # 2. The "Inception" Method: 
      # We create a Liquid string and tell Jekyll to render it.
      highlight_wrapper = <<~LIQUID
        {% codeblock %}
        {% highlight html linenos %}
        #{svg_code}
        {% endhighlight %}
        {% endcodeblock %}
      LIQUID

      highlighted_html = Liquid::Template.parse(highlight_wrapper).render(context)

      <<~HTML
      #{highlighted_html}
      <div class="svg-preview-container">
        #{svg_code}
      </div>
      HTML
    end
  end
end

Liquid::Template.register_tag("svg_snippet", Jekyll::SvgSnippetTag)