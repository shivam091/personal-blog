import { load } from "recaptcha-v3";
import { generateFullName, generateEmailDomain } from "./../helpers/sample-data";
import {
  RECAPTCHA_PUBLIC_KEY,
  CONTACT_MESSAGE_KEY
} from "./../constants/constants"

export default class ContactForm {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.siteKey = RECAPTCHA_PUBLIC_KEY;

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

      try {
        const recaptcha = await load(this.siteKey);
        const token = await recaptcha.execute("submit");

        const formData = {};
        this.form.querySelectorAll("input, textarea").forEach(field => {
          formData[field.name] = field.value;
        });
        formData["g-recaptcha-response"] = token;

        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
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
