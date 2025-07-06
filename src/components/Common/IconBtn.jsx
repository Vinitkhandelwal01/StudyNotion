export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
//    What is children in React?
// In React, children is a special prop that refers to whatever you put between the opening and closing tags of a component.

// It allows you to pass JSX (HTML-like code) inside a component — not just through normal props like text or type.

// ✅ Example of How It Works:
// jsx
// Copy code
// <IconBtn text="Click Me">
//   <FaArrowRight />
// </IconBtn>
// In this case:

// text = "Click Me" (normal prop)

// children = <FaArrowRight /> (icon component inside the button)

// So children becomes whatever is inside <IconBtn>...</IconBtn>.

// 🔍 In Your Code:
// jsx
// Copy code
// {children ? (
//   <>
//     <span className={`${outline && "text-yellow-50"}`}>{text}</span>
//     {children}
//   </>
// ) : (
//   text
// )}
// This means:

// If children (like an icon) is provided, then:

// Show the text inside a <span>, and

// Show the icon next to it

// Else, show just the text
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center ${
        outline ? "border border-yellow-50 bg-transparent" : "bg-yellow-50"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span className={`${outline && "text-yellow-50"}`}>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  )
}
