/* =================================================================
   CONTENT CONFIG

   Edit the values below to update the site — no HTML editing needed.

   To add a new project, add another object to the WORK array.

   YouTube links supported:
   - youtube.com/watch?v=...
   - youtu.be/...
   - youtube.com/shorts/...
   - youtube.com/embed/...

   Facebook links are also supported as external links.
================================================================= */

const WORK = [
  {
    title: "Reel edit — sample 1",
    youtubeUrl: "https://youtube.com/shorts/szoBP-cexVM",
    description:
      "Edited in Premiere Pro, started with AI voice-over. Time taken: 6–7 hours."
  },

  {
    title: "Promo video — sample 2",
    youtubeUrl: "https://youtube.com/shorts/B2Gl_W8SLy0",
    description:
      "Edited in After Effects, inspired by a random Instagram video and recreated. Time taken: 8–9 hours."
  },
  {
    title: "Promo video — sample 3",
    youtubeUrl: "https://www.youtube.com/watch?v=tNEtJoomB3o",
    description:
      ""
  },
  {
    title: "Promo video — sample 4",
    youtubeUrl: "https://youtube.com/shorts/7Bnr8Zw26Mc",
    description:
      "Edited in After Effects."
  },

  {
    title: "Promo video — sample 5",
    youtubeUrl: "https://youtu.be/tn85ztqu8GA?si=2awYUIhzBdGUVr_f",
    description:
      "Edited in Premiere Pro for my previous workplace. Time taken: 5 hours."
  },

  {
    title: "Facebook Reel — sample 6",
    youtubeUrl: "https://www.facebook.com/share/r/1GbJhoy6PG/",
    description:
      "Edited in Premiere Pro for my previous workplace. Time taken: 5–6 hours."
  }
];


/* ================================================================= */

const workList = document.getElementById("work-list");
const workEmpty = document.getElementById("work-empty");

/* -----------------------------------------------------------------
   Extract YouTube video ID
----------------------------------------------------------------- */

function extractYouTubeId(url) {
  if (!url) return null;

  try {
    const u = new URL(url.trim());

    // youtu.be/VIDEO_ID
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }

    // youtube.com/...
    if (u.hostname.includes("youtube.com")) {

      // /shorts/VIDEO_ID
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }

      // /embed/VIDEO_ID
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || null;
      }

      // /watch?v=VIDEO_ID
      const v = u.searchParams.get("v");

      if (v) {
        return v;
      }
    }
  } catch (e) {
    return null;
  }

  return null;
}

/* -----------------------------------------------------------------
   Check whether URL is a YouTube Shorts URL
----------------------------------------------------------------- */

function isShortsUrl(url) {
  return /youtube\.com\/shorts\//i.test(url || "");
}

/* -----------------------------------------------------------------
   Check whether URL is Facebook
----------------------------------------------------------------- */

function isFacebookUrl(url) {
  return /facebook\.com/i.test(url || "");
}

/* -----------------------------------------------------------------
   Detect YouTube orientation
----------------------------------------------------------------- */

async function detectOrientation(youtubeUrl) {

  // Shorts are normally vertical
  if (isShortsUrl(youtubeUrl)) {
    return "vertical";
  }

  try {

    const endpoint =
      "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent(youtubeUrl);

    const res = await fetch(endpoint);

    if (!res.ok) {
      throw new Error("oEmbed request failed");
    }

    const data = await res.json();

    if (data.height > data.width) {
      return "vertical";
    }

    return "horizontal";

  } catch (e) {

    // If detection fails, use horizontal
    return "horizontal";
  }
}

/* -----------------------------------------------------------------
   Build Work Item
----------------------------------------------------------------- */

function buildWorkItem(item) {

  const row = document.createElement("article");
  row.className = "work-item reveal";

  const media = document.createElement("div");
  media.className = "work-media ratio-horizontal";

  const frame = document.createElement("div");
  frame.className = "frame is-loading";
  frame.textContent = "Loading video…";

  media.appendChild(frame);

  const desc = document.createElement("div");
  desc.className = "work-desc";

  desc.innerHTML =
    '<h3 class="work-title"></h3><p class="work-text"></p>';

  desc.querySelector(".work-title").textContent =
    item.title || "Untitled";

  desc.querySelector(".work-text").textContent =
    item.description || "";

  row.appendChild(media);
  row.appendChild(desc);

  /* ---------------------------------------------------------------
     Facebook link
  --------------------------------------------------------------- */

  if (isFacebookUrl(item.youtubeUrl)) {

    frame.className = "frame facebook-frame";

    const link = document.createElement("a");

    link.href = item.youtubeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Watch this video on Facebook →";

    frame.appendChild(link);

    return row;
  }

  /* ---------------------------------------------------------------
     YouTube link
  --------------------------------------------------------------- */

  const videoId = extractYouTubeId(item.youtubeUrl);

  if (!videoId) {

    frame.className = "frame is-empty";

    frame.textContent =
      "Add a valid YouTube link for this project.";

    return row;
  }

  detectOrientation(item.youtubeUrl).then((orientation) => {

    media.classList.remove("ratio-horizontal");

    media.classList.add(
      orientation === "vertical"
        ? "ratio-vertical"
        : "ratio-horizontal"
    );

    row.classList.toggle(
      "orient-vertical",
      orientation === "vertical"
    );

    frame.className = "frame";

    const iframe = document.createElement("iframe");

    iframe.src =
      "https://www.youtube.com/embed/" + videoId;

    iframe.title =
      item.title || "Project video";

    iframe.loading = "lazy";

    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

    iframe.allowFullscreen = true;

    frame.appendChild(iframe);
  });

  return row;
}

/* -----------------------------------------------------------------
   Render Work
----------------------------------------------------------------- */

function renderWork() {

  const valid = WORK.filter(
    (w) => w && (w.title || w.youtubeUrl)
  );

  if (valid.length === 0) {

    workEmpty.hidden = false;

    return;
  }

  valid.forEach((item) => {
    workList.appendChild(buildWorkItem(item));
  });
}

renderWork();

/* -----------------------------------------------------------------
   Photo upload — stored locally in browser
----------------------------------------------------------------- */

const avatarInput = document.getElementById("avatar-input");
const avatarImg = document.getElementById("avatar-img");
const avatarPlaceholder =
  document.getElementById("avatar-placeholder");
const avatarEditBtn =
  document.getElementById("avatar-edit");

const AVATAR_KEY = "portfolio-avatar";

function setAvatar(dataUrl) {

  avatarImg.src = dataUrl;
  avatarImg.hidden = false;
  avatarPlaceholder.hidden = true;
}

const savedAvatar = localStorage.getItem(AVATAR_KEY);

if (savedAvatar) {
  setAvatar(savedAvatar);
} else {
  avatarImg.hidden = false;
  avatarPlaceholder.hidden = true;
}

avatarEditBtn.addEventListener("click", () => {
  avatarInput.click();
});

avatarInput.addEventListener("change", () => {

  const file =
    avatarInput.files && avatarInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {

    setAvatar(reader.result);

    try {

      localStorage.setItem(
        AVATAR_KEY,
        reader.result
      );

    } catch (e) {

      // Storage full or unavailable.
      // Image still works for this session.
    }
  };

  reader.readAsDataURL(file);
});

/* -----------------------------------------------------------------
   Scroll cue → jump to work section
----------------------------------------------------------------- */

document
  .getElementById("scroll-cue")
  .addEventListener("click", () => {

    document
      .getElementById("work")
      .scrollIntoView({
        behavior: "smooth"
      });
  });

/* -----------------------------------------------------------------
   Reveal-on-scroll
----------------------------------------------------------------- */

const revealTargets = () =>
  document.querySelectorAll(".reveal");

function setUpReveal() {

  if (!("IntersectionObserver" in window)) {

    revealTargets().forEach((el) => {
      el.classList.add("in");
    });

    return;
  }

  const io = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("in");

          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealTargets().forEach((el) => {
    io.observe(el);
  });
}

// Work items are added asynchronously,
// so observe on the next tick.
setTimeout(setUpReveal, 0);

/* -----------------------------------------------------------------
   Contact — click to copy email / phone
----------------------------------------------------------------- */

const toast =
  document.getElementById("copy-toast");

document
  .querySelectorAll(".contact-link")
  .forEach((link) => {

    link.addEventListener("click", (e) => {

      const value = link.dataset.copy;

      if (!value || !navigator.clipboard) {
        return;
      }

      e.preventDefault();

      navigator.clipboard
        .writeText(value)
        .then(() => {

          const note =
            link
              .closest(".contact")
              .querySelector(".footer-note");

          note.classList.add("show");

          clearTimeout(note._t);

          note._t = setTimeout(() => {
            note.classList.remove("show");
          }, 1600);

          window.open(
            value.includes("@")
              ? "mailto:" + value
              : "tel:" + value,
            "_self"
          );
        });
    });
  });
