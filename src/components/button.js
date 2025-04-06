const Button = ({text, wFull, dark}) => (
    <button className={
      `rounded-3xl px-8 py-3 mt-9e uppercase text-sm text-black
      ${dark ? "bg-black text-white" : "bg-white text-black"}
      ${wFull ? "w-full": ""}
      `}>{text}</button>
)

export default Button;