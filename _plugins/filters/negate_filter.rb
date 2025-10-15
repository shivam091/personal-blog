# frozen_string_literal: true

module Jekyll
  module NegateFilter
    def negate(input)
      !!input ? false : true
    end
  end
end

Liquid::Template.register_filter(Jekyll::NegateFilter)