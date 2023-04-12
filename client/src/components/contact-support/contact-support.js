import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { OutlinedInput, TextField, FormLabel } from "@mui/material";
import { useForm, ValidationError } from "@formspree/react";
import { fetchProfile } from "../../helpers/users";
import "./contact-support.scss";
import "./contact-support_mobile.scss";

function ContactSupport() {
  const [cookies, setCookies] = useCookies();
  const [state, handleSubmit] = useForm("moqrvzkb");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (cookies.userId) {
      fetchProfile(cookies.userId).then((res) => {
        if (res.type === "success") {
          setEmail(res.data[0].email);
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  if (state.succeeded) {
    return (
      <div className="contact-support">
        <h5>Contact Support</h5>
        <p className="receipt">
          Thank you for reaching out, we have received your message and will
          respond as soon as possible!
        </p>
      </div>
    );
  }

  return (
    <div className="contact-support">
      <h5>Contact Support</h5>
      <p className="info-message">
        You can use the following form to reach out to us regarding any issue
        with the application. We will do our best to respond in a timely manner.
      </p>
      <form onSubmit={handleSubmit}>
        <FormLabel>Contact Email</FormLabel>
        <OutlinedInput
          type="email"
          name="email"
          placeholder="email address"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />

        <FormLabel>Message</FormLabel>
        <TextField
          id="message"
          name="message"
          placeholder="reason for contact"
          fullWidth
          multiline
          minRows={12}
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
        />

        <button type="submit" disabled={state.submitting}>
          send message
        </button>
      </form>
    </div>
  );
}

export default ContactSupport;
