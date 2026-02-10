interface ValidationErrors {
    name: string;
    email: string;
    city: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    about: string,

}
  
  interface ValidationValues {
    name: string;
    email: string;
    city: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    about: string,
    
  }

  const safeTrim = (value?: string): string => {
  return value?.trim() ?? "";
};

  
export const validate = (values: ValidationValues): ValidationErrors => {
  const errors: ValidationErrors = {
    name: "",
    email: "",
    city: "",
    contactinfo: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    about: "",

  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const mobileRegex = /^(91)?0?[6-9]\d{9}$/;

  if (!safeTrim(values.name)) {
    errors.name = "Name is required";
  }

  if (!safeTrim(values.email)) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email!)) {
    errors.email = "Invalid email address";
  }

  if (!safeTrim(values.contactinfo)) {
    errors.contactinfo = "Phone is required";
  } else if (!mobileRegex.test(values.contactinfo!)) {
    errors.contactinfo = "Invalid mobile number";
  }

  if (!safeTrim(values.password)) {
    errors.password = "Password is required";
  } else if (!passwordRegex.test(values.password!)) {
    errors.password = "Invalid password format";
  }

  if (!safeTrim(values.confirmPassword)) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match!";
  }

  return errors;
};

  


 export const validateEmail = (
  values: Pick<ValidationValues, "email">
): Pick<ValidationErrors, "email"> => {
  const errors = { email: "" };
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!safeTrim(values.email)) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email!)) {
    errors.email = "Invalid email address";
  }

  return errors;
};


 export const validatePassword = (
  values: Pick<ValidationValues, "password" | "confirmPassword">
): Pick<ValidationErrors, "password" | "confirmPassword"> => {
  const errors = {
    password: "",
    confirmPassword: "",
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!safeTrim(values.password)) {
    errors.password = "Password is required";
  } else if (!passwordRegex.test(values.password!)) {
    errors.password = "Invalid password format";
  }

  if (!safeTrim(values.confirmPassword)) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match!";
  }

  return errors;
};




  
export const validateProfile = (
  values: Pick<
    ValidationValues,
    "name" | "contactinfo" | "companyName" | "city" | "about"
  >
): Pick<
  ValidationErrors,
  "name" | "contactinfo" | "companyName" | "city" | "about"
> => {
  const errors = {
    name: "",
    contactinfo: "",
    companyName: "",
    city: "",
    about: "",
  };

  const mobileRegex = /^(91)?0?[6-9]\d{9}$/;

  if (!safeTrim(values.name)) {
    errors.name = "Name is required";
  }

  if (!safeTrim(values.contactinfo)) {
    errors.contactinfo = "Phone is required";
  } else if (!mobileRegex.test(values.contactinfo!)) {
    errors.contactinfo = "Invalid mobile number";
  }

  if (!safeTrim(values.companyName)) {
    errors.companyName = "Company name is required";
  }

  if (!safeTrim(values.city)) {
    errors.city = "City is required";
  }

  if (!safeTrim(values.about)) {
    errors.about = "About is required";
  }

  return errors;
};

  