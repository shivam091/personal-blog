---
layout: post
title: "Components"
date: 2025-06-16 18:20
tags: [typography, design, styleguide]
category: General
excerpt: This post is a comprehensive test of various components. It includes alerts, code blocks, buttons, and more.
slug: components
image:
  path: /assets/img/posts/components/cover.png
  width: 1200
  height: 630
  alt: Demonstration of layout components
---

## Codeblocks

{% codeblock %}
{% highlight ruby linenos %}
# Gemfile
gem 'httparty'

# app/services/weather_api.rb
require 'httparty'

class WeatherApi
  API_KEY = 'your_api_key'
  BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

  def fetch_weather(city)
    url = "#{BASE_URL}?q=#{city}&appid=#{API_KEY}&units=metric"
    response = HTTParty.get(url)
    raise "API Error: #{response.code}" unless response.success?
    response.parsed_body
  end
end

# app/controllers/weather_controller.rb
def show
  city = params[:city]
  weather_data = WeatherApi.new.fetch_weather(city)
  @temperature = weather_data['main']['temp']
end
{% endhighlight %}
{% endcodeblock %}

## Alerts

### Default

{% alert %}
This is default alert.
{% endalert %}

### With icon, heading, and dismiss

{% alert type:"accent" dismissible:true %}
<div class="alert-heading">Information</div>
This is just for your information.
{% endalert %}

{% alert type:"success" dismissible:true %}
<div class="alert-heading">Heads Up!</div>
Your profile has been updated successfully.
{% endalert %}

{% alert type:"danger" dismissible:true %}
<div class="alert-heading">Error :(</div>
Failed to save your changes. Please try again.
{% endalert %}

{% alert type:"attention" dismissible:true %}
<div class="alert-heading">Attention</div>
This action requires confirmation.
{% endalert %}

### With icon, outline, and dismiss

{% alert type:"accent" dismissible:true outlined:true %}
An example outlined accent alert with an icon.
{% endalert %}

{% alert type:"success" dismissible:true outlined:true %}
An example outlined success alert with an icon.
{% endalert %}

{% alert type:"danger" dismissible:true outlined:true %}
An example outlined danger alert with an icon.
{% endalert %}

{% alert type:"attention" dismissible:true outlined:true %}
An example outlined attention alert with an icon.
{% endalert %}

### With links

{% alert type:"accent" %}
<div class="alert-heading">Information</div>
This is an <a href="#">important notification</a> that requires your attention.
You can <a href="/settings">update your settings here</a>.
An example showing the <code class="language-plaintext highlighter-rouge">warning</code> type prompt.
{% endalert %}

### Markdown support

{% alert type:"danger" markdown:true %}
### Markdown enabled alert
{:.alert-heading}

This content is **processed** as _Markdown_.
{% endalert %}
