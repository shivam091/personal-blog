Jekyll::Hooks.register :site, :post_read do |site|
  # Start with posts and pages
  all_docs = site.pages + site.posts.docs

  # Add all other collections except "posts"
  site.collections.each do |name, collection|
    next if name == "posts" # already added
    all_docs.concat(collection.docs)
  end

  all_docs.each do |doc|
    path = doc.path
    next unless File.exist?(path)

    # Skip if file is not tracked by git
    tracked = system("git", "ls-files", "--error-unmatch", path, out: File::NULL, err: File::NULL)
    next unless tracked

    begin
      published_raw = `git log --diff-filter=A --follow --format="%ad" --date=iso-strict "#{path}" | tail -1`.strip
      modified_raw  = `git log -1 --format="%ad" --date=iso-strict "#{path}"`.strip

      doc.data["published_at"]     = Time.parse(published_raw).iso8601 unless published_raw.empty?
      doc.data["last_modified_at"] = Time.parse(modified_raw).iso8601  unless modified_raw.empty?
    rescue => e
      Jekyll.logger.warn "Metadata:", "Failed to parse git dates for #{path} (#{e.class}: #{e.message})"
      next
    end
  end
end
