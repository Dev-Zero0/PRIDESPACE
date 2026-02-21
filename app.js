import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpkRcmTFE4EslVH6fah7C8milZXB_3e54",
  authDomain: "pridespace-fb3a3.firebaseapp.com",
  projectId: "pridespace-fb3a3",
  storageBucket: "pridespace-fb3a3.firebasestorage.app",
  messagingSenderId: "409422383001",
  appId: "1:409422383001:web:f91c804a23a2aa03ac3508",
};

const searchInput = document.getElementById("searchInput");
let allStories = [];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const publishBtn = document.getElementById("publishBtn");
const titleInput = document.getElementById("titleInput");
const pseudonymInput = document.getElementById("pseudonymInput");
const categorySelect = document.getElementById("categorySelect");
const storyTextarea = document.getElementById("storyTextarea");
const storyContainer = document.querySelector(".stories");

/* Loading skeleton cards */
function showLoading() {
  storyContainer.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `
      <div class="skeleton-tag"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text"></div>
    `;
    storyContainer.appendChild(skeleton);
  }
}
showLoading();

/* Publish story */
publishBtn.addEventListener("click", publishStory);
storyTextarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    publishStory();
  }
});
async function publishStory() {
  const title = titleInput.value.trim();
  const story = storyTextarea.value.trim();
  const author = pseudonymInput.value.trim() || "Anonymous";
  if (!title) return alert("Title is required.");
  if (!story) return alert("Story content is required.");

  publishBtn.disabled = true;
  const origText = publishBtn.textContent;
  publishBtn.textContent = "Publishing";
  const spinner = document.createElement("span");
  spinner.className = "spinner";
  publishBtn.appendChild(spinner);

  await addDoc(collection(db, "stories"), {
    title,
    category: categorySelect.value,
    author,
    content: story,
    createdAt: new Date(),
  });

  titleInput.value = "";
  pseudonymInput.value = "";
  storyTextarea.value = "";

  publishBtn.disabled = false;
  publishBtn.textContent = origText;
}

/* Real-time stories */
const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  allStories = [];

  snapshot.forEach((docSnap) => {
    allStories.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  renderStories(allStories);
});

function renderStories(stories) {
  storyContainer.innerHTML = "";

  if (stories.length === 0) {
    storyContainer.innerHTML = "<p>No stories found.</p>";
    return;
  }

  stories.forEach((story) => {
    const storyId = story.id;

    const timestamp = story.createdAt?.toDate
      ? story.createdAt.toDate().toLocaleString()
      : "";

    const card = document.createElement("div");
    card.className = "story-card";

    card.innerHTML = `
      <div class="tag">${story.category}</div>
      <h2>${story.title}</h2>
      <div class="author">By ${story.author}</div>
      <div class="timestamp">${timestamp}</div>
      <p>${story.content}</p>
      <div class="replies" id="replies-${storyId}"></div>
      <div class="reply-box">
        <input type="text" id="replyInput-${storyId}" placeholder="Write a reply..."/>
        <button id="replyBtn-${storyId}">Reply</button>
      </div>
    `;

    storyContainer.appendChild(card);

    const replyBtn = document.getElementById(`replyBtn-${storyId}`);
    const replyInput = document.getElementById(`replyInput-${storyId}`);

    replyBtn.addEventListener("click", () => sendReply(storyId, replyInput));
    replyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendReply(storyId, replyInput);
      }
    });

    listenToReplies(storyId);
  });
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase().trim();

  const filtered = allStories.filter(
    (story) =>
      story.title.toLowerCase().includes(term) ||
      story.author.toLowerCase().includes(term) ||
      story.category.toLowerCase().includes(term),
  );

  renderStories(filtered);
});

/* Replies */
async function sendReply(storyId, input) {
  let text = input.value.trim();
  if (!text) return alert("Reply cannot be empty.");
  const alias =
    prompt("Enter your name/alias (leave empty for Anonymous)") || "Anonymous";

  const replyBtn = document.getElementById(`replyBtn-${storyId}`);
  replyBtn.disabled = true;
  const origText = replyBtn.textContent;
  replyBtn.textContent = "Sending";
  const spinner = document.createElement("span");
  spinner.className = "spinner";
  replyBtn.appendChild(spinner);

  await addDoc(collection(db, "stories", storyId, "replies"), {
    text,
    author: alias,
    createdAt: new Date(),
  });

  input.value = "";
  replyBtn.disabled = false;
  replyBtn.textContent = origText;
}

function listenToReplies(storyId) {
  const repliesRef = collection(db, "stories", storyId, "replies");
  onSnapshot(repliesRef, (snapshot) => {
    const container = document.getElementById(`replies-${storyId}`);
    container.innerHTML = "";
    snapshot.forEach((doc) => {
      const reply = doc.data();
      const replyTime = reply.createdAt?.toDate
        ? reply.createdAt.toDate().toLocaleString()
        : "";
      const p = document.createElement("div");
      p.className = "reply";
      p.innerHTML = `<span class="timestamp">${replyTime}</span> <b>${reply.author}:</b> ${reply.text}`;
      container.appendChild(p);
    });
  });
}

/* Mobile menu */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => navLinks.classList.toggle("active"));
