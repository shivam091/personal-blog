# frozen_string_literal: true

require_relative "./../helpers/posts_helper"
require_relative "./../helpers/logger_helper"

module Jekyll
  class SeriesPage < Page
    def initialize(site, base, dir, series_id, content, frontmatter, posts, index, total)
      @site = site
      @base = base
      @dir  = dir
      @name = "index.html"

      self.process(@name)
      self.read_yaml(File.join(base, "_layouts"), "series.html")
      self.content = content

      title = frontmatter["title"] || series_id

      self.data.merge!(
        "layout"        => "series",
        "title"         => title,
        "series_id"     => series_id,
        "series_meta"   => frontmatter,
        "excerpt"       => frontmatter["excerpt"],
        "changelog"     => frontmatter["changelog"],
        "posts"         => posts,
        "series_index"  => index + 1,
        "series_total"  => total,
        "permalink"     => "/series/#{series_id}"
      )
    end
  end

  class SeriesGenerator < Generator
    include PostsHelper, LoggerHelper

    safe true
    priority :high

    def generate(site)
      info("▶ SeriesGenerator:", "Generating series pages")

      series_docs = site.collections["series"]&.docs || []

      # Build fast lookup for posts by slug
      slug_map = build_slug_map(site.posts.docs)

      # Parse _series/*.md files into series_data
      series_data = series_docs.each_with_object({}) do |doc, hash|
        id = doc.basename_without_ext
        parts = doc.data["parts"] || []

        if parts.empty?
          warn("Series '#{id}' has no defined parts.")
        end

        posts = parts.map { |slug| slug_map[slug] }.compact

        hash[id] = {
          "id"      => id,
          "doc"     => doc,
          "posts"   => posts,
          "content" => site.find_converter_instance(Jekyll::Converters::Markdown).convert(doc.content)
        }
      end

      sorted_series = series_data.sort_by { |_, data|
        [
          data["doc"].data["order"] || 99999,
          data["doc"].data["title"].to_s.downcase
        ]
      }
      total_series = sorted_series.size

      sorted_series.each_with_index do |(series_id, data), index|
        posts = data["posts"]
        if posts.empty?
          warn("Series '#{series_id}' has no matching posts.")
          next
        end

        frontmatter = data["doc"].data
        content     = data["content"]

        # Annotate each post with series info
        posts.each_with_index do |post, i|
          post.data["series"] = {
            "id"          => series_id,
            "meta"        => frontmatter,
            "index"       => i + 1,
            "total"       => posts.size,
            "page_url"    => "/series/#{series_id}",
            "title"       => frontmatter["title"],
          }

          # Post-to-post navigation
          post.data["previous_post"] = posts[i - 1] if i > 0
          post.data["next_post"]     = posts[i + 1] if i < posts.size - 1
        end

        dir  = File.join("series", series_id)
        page = SeriesPage.new(site, site.source, dir, series_id, content, frontmatter, posts, index, total_series)

        # Series-to-series navigation
        page.data["previous"] = nav_info(sorted_series, index - 1) if index > 0
        page.data["next"]     = nav_info(sorted_series, index + 1) if index < total_series - 1

        site.pages << page
      end
    end

    private

    def nav_info(series_list, index)
      id, meta = series_list[index]
      {
        "url"   => "/series/#{id}",
        "title" => meta["doc"].data["title"] || id
      }
    end
  end
end
