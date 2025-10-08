import { load } from "recaptcha-v3";
import { generateFullName, generateEmailDomain } from "./../helpers/sample-data";
import { CONTACT_MESSAGE_KEY, RECAPTCHA_PUBLIC_KEY } from "./../constants/constants"

export default class ContactForm {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.siteKey = RECAPTCHA_PUBLIC_KEY

    if (this.form) {
      this.endpoint = this.form.getAttribute("action");
      this.#setRandomPlaceholders();
      this.#restoreFields();
      this.#bindEvents();
    }
  }

  #setRandomPlaceholders() {
    const nameField = this.form.querySelector("input[name='name']");
    const emailField = this.form.querySelector("input[name='email']");

    if (nameField && !nameField.placeholder) {
      const fakeName = generateFullName();
      nameField.placeholder = fakeName;

      if (emailField && !emailField.placeholder) {
        const firstName = fakeName.match(/^Dr\./)
          ? "the-doctor"
          : fakeName.split(" ")[0].toLowerCase();
        const domain = generateEmailDomain();

        emailField.placeholder = `${firstName}@${domain}`;
      }
    }
  }

  #bindEvents() {
    this.form.querySelectorAll("input, textarea").forEach(field => {
      field.addEventListener("input", () => {
        const data = this.#getStoredData();
        data[field.name] = field.value;
        localStorage.setItem(CONTACT_MESSAGE_KEY, JSON.stringify(data));
      });
    });

    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = this.form.querySelector("[type='submit']");
      submitBtn.disabled = true;

      try {
        if (!(await this.verifyRecaptcha())) {
          alert("reCAPTCHA failed. Please try again.");
          return;
        }

        // if verified, submit form to Netlify
        const formData = new FormData(this.form);
        const formResponse = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString()
        });

        if (formResponse.ok) {
          this.form.reset();
          localStorage.removeItem(CONTACT_MESSAGE_KEY);
          alert("Message sent successfully!");
        } else {
          alert("Error submitting form.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error, please try again later.");
      }
    });
  }

  async verifyRecaptcha() {
    const key = this.siteKey;
    if (!key) return true; // skip in dev

    const recaptcha = await load(key);
    const token = await recaptcha.execute("submit");

    const res = await fetch("/.netlify/functions/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    return res.ok && data.success;
  }

  #restoreFields() {
    const saved = this.#getStoredData();
    this.form.querySelectorAll("input, textarea").forEach(field => {
      if (saved[field.name]) {
        field.value = saved[field.name];
      }
    });
  }

  #getStoredData() {
    try {
      return JSON.parse(localStorage.getItem(CONTACT_MESSAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  static init() {
    new ContactForm("#contact-form");
  }
}
