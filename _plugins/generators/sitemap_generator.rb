# frozen_string_literal: true

require_relative "./../helpers/logger_helper"

module Jekyll
  class SitemapGenerator < Generator
    include LoggerHelper

    safe true
    priority :lowest

    def generate(site)
      info("▶ SitemapGenerator:", "Generating sitemap")

      sitemap_xml = build_sitemap(site)
      file_path = File.join(site.dest, "sitemap.xml")

      FileUtils.mkdir_p(site.dest)
      File.write(file_path, sitemap_xml)
      File.chmod(0644, file_path) if File.exist?(file_path) # Ensure readable by servers

      site.keep_files ||= []
      site.keep_files << "sitemap.xml"

      info("✔ SitemapGenerator:", "sitemap.xml written to #{file_path}")
    end

    def build_sitemap(site)
      baseurl = site.config["url"].to_s.chomp("/")

      # Start with posts and pages
      all_docs = site.pages + site.posts.docs

      # Add all other collections except "posts"
      site.collections.each do |name, collection|
        next if name == "posts" || name == "series" || name == "snippets" # already added
        all_docs.concat(collection.docs)
      end

      xml = +<<~XML
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      XML

      all_docs.sort_by { |doc| doc.url }.each do |doc|
        next if doc.data["sitemap"] == false || doc.url.nil?
        url = "#{baseurl}#{doc.url}".gsub(/\/+/, "/").sub(":/", "://")

        lastmod_raw = doc.data["last_modified_at"]

        xml << "  <url>\n"
        xml << "    <loc>#{url}</loc>\n"
        xml << "    <lastmod>#{Time.parse(lastmod_raw.to_s).rfc2822}</lastmod>\n" if lastmod_raw
        xml << "  </url>\n"
      end

      xml << "</urlset>\n"

      xml.gsub!(/\n\s*/, "") if site.config.dig("sitemap", "minify")
      xml
    end
  end
end
