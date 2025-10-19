type UserPhone = string | number;
type Nullable<T> = T | null | undefined;

const name: string = "Nazarii";
const surname: string = "Schevchenko";
const dateOfBirth: string | Date = new Date("1993-01-15");
const phone: UserPhone = "+380991234567";
const optionalMiddleName: Nullable<string> = null;

const printUser = (
  name: string,
  surname: string,
  dateOfBirth?: Nullable<string | Date>,
  phone?: Nullable<UserPhone>,
): void => {
  const fmtDateOfBirth =
    dateOfBirth instanceof Date
      ? dateOfBirth.toISOString().slice(0, 10)
      : dateOfBirth ?? "—";

  const fmtPhone = phone ?? "—";

  console.log("=== User Info ===");
  console.log(`Name: ${name}`);
  console.log(`Surname: ${surname}`);
  console.log(`Date of birth: ${fmtDateOfBirth}`);
  console.log(`Phone: ${fmtPhone}`);
};

printUser(name, surname, dateOfBirth, phone);

export {};
