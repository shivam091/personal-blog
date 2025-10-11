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
      all_docs = (site.pages + site.posts.docs).uniq.compact.reject do |doc|
        doc.url.nil? || doc.url.end_with?("sitemap.xml") || doc.url =~ /\.(xml|rss)$/
      end

      xml = +<<~XML
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      XML

      all_docs.sort_by { |doc| doc.url }.each do |doc|
        next if doc.data["sitemap"] == false

        url = "#{baseurl}#{doc.url}".gsub(/\/+/, "/").sub(":/", "://")
        lastmod_raw = doc.data["last_modified_at"] || doc.data["date"] || site.time
        lastmod = Time.parse(lastmod_raw.to_s).rfc2822

        priority = doc.data["priority"] || calc_priority(doc)
        changefreq = doc.data["changefreq"] || "monthly"

        xml << <<~URL
          <url>
            <loc>#{url}</loc>
            <lastmod>#{lastmod}</lastmod>
            <priority>#{priority}</priority>
            <changefreq>#{changefreq}</changefreq>
          </url>
        URL
      end

      xml << "</urlset>\n"
      xml.gsub!(/\n\s*/, "") if site.config.dig("sitemap", "minify")
      xml
    end

    def calc_priority(doc)
      return "1.0" if doc.url == "/"
      return "0.8" if doc.respond_to?(:collection) && doc.collection.label == "posts"
      return "0.4" if doc.url.include?("privacy") || doc.url.include?("terms")
      "0.6"
    end
  end
end
