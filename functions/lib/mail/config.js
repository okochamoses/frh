// Local development never touches the real mailbox: the functions emulator sets
// FUNCTIONS_EMULATOR, so we point nodemailer at MailDev instead (started by
// `npm run dev:local`). Every send is then readable at http://127.0.0.1:1080.
const useLocalSmtp = process.env.FUNCTIONS_EMULATOR === "true";

const PRODUCTION_MAIL = {
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  fromName: "Mariam at FRH",
  fromAddress: process.env.SMTP_USER,
  ownerEmail: process.env.SMTP_USER,
};

const LOCAL_MAIL = {
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false,
  // MailDev takes anonymous senders; sending credentials would make it reject us.
  user: null,
  pass: null,
  fromName: "Mariam at FRH (local)",
  fromAddress: "mariam@flourish.local",
  ownerEmail: process.env.SMTP_USER || "owner@flourish.local",
};

const MAIL_CONFIG = useLocalSmtp ? LOCAL_MAIL : PRODUCTION_MAIL;

module.exports = { MAIL_CONFIG };
