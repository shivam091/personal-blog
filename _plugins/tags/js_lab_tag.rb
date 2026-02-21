require "liquid"
require "cgi"
require "json"
require "base64"

module Jekyll
  class JSLabTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @params = {}
      markup.scan(/(\w+):\s*([^\s]+)/) do |key, value|
        @params[key] = value
      end
    end

    def render(context)
      site = context.registers[:site]
      demo_id_raw = resolve(@params["demo_id"], context)
      demo = site.data.dig("js_labs", demo_id_raw)

      return "" unless demo

      js_code = demo["js"].to_s.strip
      display_code = CGI.escapeHTML(js_code)
      encoded_js = Base64.strict_encode64(js_code)

      <<~HTML
        <div class="js-lab-container" data-demo-id="#{demo_id_raw}">
          <div class="js-lab-header">
            <span class="js-lab-title">#{demo["title"] || "JS Lab"}</span>
            <button class="btn btn-sm btn-secondary" onclick="runJsLabDemo(this, '#{encoded_js}')">
              ▶ Run Code
            </button>
          </div>

          <div class="js-lab-code">
            <pre><code>#{display_code}</code></pre>
          </div>

          <div class="js-lab-console">
            <div class="console-label">Console Output</div>
            <div class="console-output"></div>
          </div>
        </div>
      HTML
    end

    private

    def resolve(value, context)
      context[value] || value
    end
  end
end

Liquid::Template.register_tag("js_lab", Jekyll::JSLabTag)
