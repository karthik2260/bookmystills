interface ValidationErrors {
  name: string;
  email: string;
  city: string;
  contactinfo: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  about: string;
  portfolioImages: string;
  aadharImages: string;
}

interface ValidationValues {
  name: string;
  email: string;
  city: string;
  contactinfo: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  about: string;
  portfolioImages: File[];
  aadharImages: File[];
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
    portfolioImages: "",
    aadharImages: "",
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

  if (!values.portfolioImages || values.portfolioImages.length === 0) {
    errors.portfolioImages = "Please upload sample photos";
  } else if ((values.portfolioImages?.length ?? 0) < 3) {
    errors.portfolioImages = "Upload at least 3 photos";
  } else if (values.portfolioImages.length > 5) {
    errors.portfolioImages = "Maximum 5 photos allowed";
  }

  if (!values.aadharImages || values.aadharImages.length < 2) {
    errors.aadharImages = "Both Aadhaar front and back images are required";
  } else if (values.aadharImages.length > 2) {
    errors.aadharImages = "Only 2 images allowed (front and back)";
  } else {
    errors.aadharImages = "";
  }

  return errors;
};

export const validateEmail = (
  values: Pick<ValidationValues, "email">,
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
  values: Pick<ValidationValues, "password" | "confirmPassword">,
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
  values: Pick<ValidationValues, "name" | "contactinfo">,
): Pick<ValidationErrors, "name" | "contactinfo"> => {
  const errors: Pick<ValidationErrors, "name" | "contactinfo"> = {
    name: "",
    contactinfo: "",
  };
  const mobileRegex = /^(91)?0?[6-9]\d{9}$/;
  if (!values.name.trim()) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
    errors.name = "Should not contain numbers or special characters!";
  }

  if (!values.contactinfo.trim()) {
    errors.contactinfo = "Phone is required";
  } else if (!mobileRegex.test(values.contactinfo)) {
    errors.contactinfo = "Invalid mobile number";
  }

  return errors;
};
