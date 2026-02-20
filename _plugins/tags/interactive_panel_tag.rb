# _plugins/interactive_panel_tag.rb
require "liquid"
require "cgi"

module Jekyll
  class InteractivePanelTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @params = {}
      markup.scan(/(\w+):\s*([^\s]+)/) do |key, value|
        @params[key] = value
      end
    end

    def render(context)
      site = context.registers[:site]

      demo_id   = resolve(@params["demo_id"], context)
      iframe_id = resolve(@params["id"], context)
      demo = site.data.dig("svg_demos", demo_id)

      return "<!-- interactive_panel: demo not found -->" unless demo

      title = CGI.escapeHTML(demo["title"].to_s)
      css   = CGI.escapeHTML([demo["css"]].flatten.compact.join("\n"))
      html  = CGI.escapeHTML([demo["html"]].flatten.compact.join("\n"))
      js    = CGI.escapeHTML([demo["js"]].flatten.compact.join("\n"))

      <<~HTML
        <div class="interactive-panel">
          <div class="interactive-panel-header">#{title}</div>
          <iframe
            id="iframe-#{iframe_id}"
            class="interactive-panel-iframe"
            title="#{demo_id}"
            loading="lazy"
            srcdoc='
              <!DOCTYPE html>
              <html>
                <head>
                  <style>#{css}</style>
                </head>
                <body>
                  #{html}
                  <script>
                    function applyTheme(theme) {
                      document.documentElement.setAttribute("data-theme", theme);
                    }

                    // Ask parent for theme immediately
                    window.parent?.postMessage({ type: "theme-request" }, "*");

                    // Receive theme updates
                    window.addEventListener("message", (e) => {
                      if (e.data?.type === "theme-change") {
                        applyTheme(e.data.theme);
                      }
                    });

                    #{js}
                  </script>
                </body>
              </html>
            '>
          </iframe>
        </div>
      HTML
    end

    private

    def resolve(value, context)
      return nil unless value
      context[value] || value
    end
  end
end

Liquid::Template.register_tag("interactive_panel", Jekyll::InteractivePanelTag)
