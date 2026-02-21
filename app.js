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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const publishBtn = document.getElementById("publishBtn");
const titleInput = document.getElementById("titleInput");
const pseudonymInput = document.getElementById("pseudonymInput");
const categorySelect = document.getElementById("categorySelect");
const storyTextarea = document.getElementById("storyTextarea");
const storyContainer = document.querySelector(".stories");

publishBtn.addEventListener("click", publishStory);

async function publishStory() {
  const title = titleInput.value.trim();
  const story = storyTextarea.value.trim();
  const author = pseudonymInput.value.trim() || "Anonymous";

  if (!title || !story) return alert("Missing fields.");

  publishBtn.disabled = true;
  publishBtn.textContent = "Publishing...";

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
  publishBtn.textContent = "Publish Story";
}

const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  storyContainer.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const story = docSnap.data();
    const storyId = docSnap.id;

    const card = document.createElement("div");
    card.className = "story-card";
    card.innerHTML = `
      <div class="tag">${story.category}</div>
      <h2>${story.title}</h2>
      <div class="author">By ${story.author}</div>
      <div class="timestamp">${story.createdAt?.toDate().toLocaleString()}</div>
      <p>${story.content}</p>
      <div class="replies" id="replies-${storyId}"></div>
      <div class="reply-box">
        <input type="text" id="replyInput-${storyId}" placeholder="Write a reply..." />
        <button id="replyBtn-${storyId}">Reply</button>
      </div>
    `;

    storyContainer.appendChild(card);

    document
      .getElementById(`replyBtn-${storyId}`)
      .addEventListener("click", () =>
        sendReply(storyId, document.getElementById(`replyInput-${storyId}`)),
      );

    listenToReplies(storyId);
  });
});

async function sendReply(storyId, input) {
  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "stories", storyId, "replies"), {
    text,
    author: "Anonymous",
    createdAt: new Date(),
  });

  input.value = "";
}

function listenToReplies(storyId) {
  const repliesRef = collection(db, "stories", storyId, "replies");

  onSnapshot(repliesRef, (snapshot) => {
    const container = document.getElementById(`replies-${storyId}`);
    container.innerHTML = "";

    snapshot.forEach((doc) => {
      const reply = doc.data();
      const div = document.createElement("div");
      div.className = "reply";
      div.textContent = `${reply.author}: ${reply.text}`;
      container.appendChild(div);
    });
  });
}

/* Mobile nav */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
