(async () => {
  const storage = await chrome.storage.local.get(["credentials"]);
  if (storage.credentials) {
    document.getElementById("form-api-key")?.classList.remove("hidden");
    document.getElementById("button-generate-api-key")?.classList.add("hidden");
  } else {
    document.getElementById("form-api-key")?.classList.add("hidden");
    document.getElementById("button-generate-api-key")?.classList.remove("hidden");
  }
})();

const generateRandomKey = (length: number): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

document.getElementById("button-generate-api-key-action")?.addEventListener("click", function () {
  const randomKey = generateRandomKey(32);
  chrome.storage.local.set({ credentials: randomKey }).then(() => {
    document.getElementById("form-api-key")?.classList.remove("hidden");
    document.getElementById("button-generate-api-key")?.classList.add("hidden");
    document.querySelector<HTMLInputElement>("#form-api-key input")!.value = randomKey;
  });
});
