export const extractAadhaarDetails = (data: any) => {
  const result = {
    aadhaarNumber: "",
    name: "",
    dob: "",
    gender: "",
    address: "",
  };

  const fields = data?.extracted_fields;

  if (!fields) return result;

  // Aadhaar Number
  if (fields["Aadhar Numbers"]?.length) {
    result.aadhaarNumber = fields["Aadhar Numbers"][0];
  }

  // Name
  if (fields["Names"]?.length) {
    result.name = fields["Names"][0];
  }

  // DOB
  if (fields["Date of Birth"]?.length) {
    result.dob = fields["Date of Birth"][0];
  }

  // Gender
  if (fields["Gender"]?.length) {
    result.gender = fields["Gender"][0];
  }

  // Address (combine all)
  if (fields["address"]?.length) {
    result.address = fields["address"].join(" ");
  }

  return result;
};