# frozen_string_literal: true

module Jekyll
  module ArchiveMeta
    # Common initialization logic for TagPage and CategoryPage
    def set_archive_meta(archive_type, slug_key, archive_name, posts)
      # Determine the key for the data file (e.g., "tag_meta" or "category_meta")
      meta_key = "#{archive_type}_meta"

      # Determine the default title and description format
      default_title_prefix = (archive_type == :tag ? "Posts tagged with: " : "All Posts in Category: ")
      default_description_prefix = (archive_type == :tag ? "A collection of posts tagged with the topic: " : "A collection of posts categorized under: ")

      # Fetch custom data from _data/tag_meta.yml or _data/category_meta.yml
      archive_data = @site.data.fetch(meta_key, {})[slug_key]

      # Set page title with fallback
      page_title = if archive_data && archive_data["title"]
                     archive_data["title"]
                   else
                     "#{default_title_prefix}#{archive_name}"
                   end

      # Set meta description with fallback
      meta_description = if archive_data && archive_data["description"]
                           archive_data["description"]
                         else
                           "#{default_description_prefix}#{archive_name}."
                         end

      # Assign data to the page object
      self.data[archive_type.to_s] = archive_name
      self.data["title"] = page_title
      self.data["description"] = meta_description
      self.data["permalink"] = "/#{archive_type}/#{slug_key}"
      self.data["posts"] = posts
    end
  end
end