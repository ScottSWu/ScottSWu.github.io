---
layout: splash
permalink: /projects/
title: Projects
---

{% for project in site.data.projects %}
<div class="project" data-url="{{ project.url }}">
  <div class="project-thumbnail">
    <img src="{{ project.thumbnail }}" />
  </div>
  <div class="project-name">
    {{ project.name }}
  </div>
  <div class="project-description">
    {{ project.description }}
  </div>
</div>
{% cycle '', '<hr class="project-clear" />' %}
{% endfor %}
<script type="text/javascript">
var projects = document.querySelectorAll(".project");
for (var i = 0; i < projects.length; i++) {
  projects[i].onclick = (function(p) {
    return function() {
      location.assign(p.getAttribute("data-url"));
    };
  })(projects[i]);
}
</script>
