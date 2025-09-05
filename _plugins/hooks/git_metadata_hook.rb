# frozen_string_literal: true

require "time"

Jekyll::Hooks.register :site, :post_read do |site|
  all_pages = site.pages + site.posts.docs

  all_pages.each do |page|
    path = page.path
    next unless File.exist?(path)

    # Skip if file is not tracked by git
    tracked = system("git", "ls-files", "--error-unmatch", path, out: File::NULL, err: File::NULL)
    next unless tracked

    begin
      # Get first commit (oldest) and last commit (newest)
      published_raw = `git log --diff-filter=A --follow --format="%ad" --date=iso-strict "#{path}" | tail -1`.strip
      modified_raw  = `git log -1 --format="%ad" --date=iso-strict "#{path}"`.strip

      page.data["published_at"]     = Time.parse(published_raw).iso8601 unless published_raw.empty?
      page.data["last_modified_at"] = Time.parse(modified_raw).iso8601  unless modified_raw.empty?
    rescue => e
      Jekyll.logger.warn "Changelog:", "Failed to parse git dates for #{path} (#{e.class}: #{e.message})"
      next
    end
  end
end
