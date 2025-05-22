import { Inngest } from "inngest";
import { Resend } from "resend";


export const inngest = new Inngest({
  id: "splitr",
  name: "Splitr",
});

export const resend = new Resend(process.env.RESEND_API_KEY); 