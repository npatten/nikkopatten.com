<%
meta("../../meta.json")
meta()
const path = require('path');
url = url + "/posts/" + path.basename(path.dirname(outputPath)) + "/";
%>
<%= render("../../\_partials/post-header.html", { title, image: null, caption: "", url }) %>

Welcome, Kia ora, Willkommen, Fique à vontade

## Why this exists

After some twenty plus years of getting distracted, I finally got a site up.
Thank you to [Armin](https://lucumr.pocoo.org/about/) and especially [Mario](https://mariozechner.at/) for the inspiration to actually sit and write like this. As the whole software industry attempts to reinvent itself in a dozen different ways while riding the clankers off the nearest security cliff, I'm finding myself with a lot of reflection and sythesis todo. My friends and colleagues who have been kind enough to listen to me verbally process have given me enough indication that others might want to read what I have to say that it finally got me over the inertia barrier to get this setup.

## What it's built with

Double thanks to Mario for the template to build this site using his [blargh](https://github.com/badlogic/blargh) library; exactly the kind of setup I was looking for. 🍻

## My history with AI

_Is it still slop if I write every character by hand?_

I've been geeking out on AI for a long time, though not as long as some.
I suppose it was a somewhat predictable follow up to the neuroscience reading binge I went on with my [dad](https://www.frankdrake.org/) who also slung code before he semi-retired into a full time musician.
I vividly remember reading [On Intelligence](https://www.numenta.com/resources/books/on-intelligence-book-by-jeff-hawkins/) by Jeff Hawkins, and being entirely hooked by the idea of trying to build digital systems inspired by the human brain. It was a big part of what led me to pick an AI as my undergrad capstone, building a simple markov chain system to generate 'novel' classical music using next note prediction based off training from MIT's music21 corpus on Beethoven. (Thank you [Jim Shargo](https://www.linkedin.com/in/jim-shargo-38b65239/) for being the best partner I could hope for on that project. I still miss working with you!)

Through the intervening years I eagerly devoured news of Xbox Kinect projects, IBM Watson, [AlexNet](https://en.wikipedia.org/wiki/AlexNet), AlphaGo _(goodness I'm a sucker for that documentary)_, and of course all the buzz around Google's [Attention is all you Need](https://arxiv.org/abs/1706.03762) paper and the emergence of the modern era of GPT dominance. We sadly never got to applying ML or AI at Sparkfund; it was forever a 'next quarter' initiative we never found the time for, despite being lucky enough to have some brilliant AI minds like [Nathan Sorenson](https://github.com/takeoutweight) on the team.

##### Everything's an iceberg

I confess, I started Junglytics in an attempt to do an end run on capitalism. The goal was to crank out a solid product in an under served software niche, cashout, and do as much good as possible with the earnings. I founded it with an old buddy from the Intuit RDP program who had found an impressive amount of success on Amazon. So we built a tiny team and spent close to two years slogging through some of the gnarliest data work I've ever encountered. You'd think Amazon would have decent data, but good grief, they make government data look pristine. In a stroke of luck, right when we had our data pipelines and query engine in a solid place OpenAI launched GPT-4 with 'Function Calling' <q-l href="https://openai.com/index/function-calling-and-other-api-updates/"></q-l> in June of 2023.

We gathered the whole team together in Costa Rica, where two of our colleagues were based, and pulled together a working PoC in a week. We ended up with a shockingly decent natural language interface for sellers to get whatever data (mostly) they needed out of Amazon about their 3P store, nicely visualized. A month or two of polish later, and we were showing it off at our booth at the big annual ecommerce event, Prosper. Two of the Carbon6 founders saw our demo, and shortly after we were in acquisition talks with them. I didn't get the monetary outcome I had hoped for, I barely made back what I had put into the company, but I'm not mad about getting the 'successful AI startup exit' merit badge and a decent stable job to help build back my frighteningly depleted savings.

That experience really drove home to me how powerful an LLM + tools could be. It's wild now to see just how broadly that's proven to be true, especially with agent harnesses. (Someone needs to write a love song about Unix + LLMs.)

<%= render("../../\_partials/post-footer.html", { title, url }) %>
