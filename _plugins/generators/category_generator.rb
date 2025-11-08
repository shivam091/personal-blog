# frozen_string_literal: true

require "jekyll/utils"

require_relative "./../helpers/logger_helper"
require_relative "./../helpers/archive_meta"

module Jekyll
  class CategoryPage < Page
    include ArchiveMeta

    def initialize(site, base, dir, category, posts)
      @site = site
      @base = base
      @dir  = dir
      @name = "index.html"

      category_slug = Jekyll::Utils.slugify(category, mode: "default", cased: false)

      category_data = @site.data.fetch("category_meta", {})[category_slug]

      self.process(@name)
      self.read_yaml(File.join(base, "_layouts"), "archive.html")

      set_archive_meta(:category, category_slug, category, posts)
    end
  end

  class CategoryGenerator < Generator
    include LoggerHelper

    safe true
    priority :high

    def generate(site)
      info("▶ CategoryGenerator:", "Generating category pages")

      site.categories.each do |category, posts|
        site.pages << CategoryPage.new(site, site.source, "categories", category, posts)
      end
    end
  end
end
