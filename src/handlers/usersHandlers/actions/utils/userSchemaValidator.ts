import * as Yup from "yup";

const schema = Yup.object().shape({
  username: Yup.string()
    .min(5, "Username must be at least 5 characters long")
    .max(16, "Username can't be more than 16 characters long")
    .required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .required("Required")
    .min(8, "Password must be must be at least 8 characters long"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

export default schema;
