# -*- frozen_string_literal: true -*-

source "https://rubygems.org"

# Ruby version
ruby "3.3.7"

# Simple, blog-aware, static sites
gem "jekyll", "~> 4.4.1"

# Loofah is a general library for manipulating and transforming HTML/XML documents and fragments.
gem "loofah", "~> 2"

group :jekyll_plugins do
  # Add metadata tags for search engines and social networks
  gem "jekyll-seo-tag", "~> 2.8"

  # Pagination gem built specially for Jekyll 3, and newer
  gem "jekyll-paginate-v2", "~> 3.0"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", platforms: [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", platforms: [:jruby]
