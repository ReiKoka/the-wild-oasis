import supabase from "./supabase";
import { getCode } from "country-list";

export async function createGuest(newGuest) {
  const {
    fullNameGuest: fullName,
    emailGuest: email,
    nationalID,
    nationality,
  } = newGuest;
  const countryFlag = `https://flagcdn.com/${getCode(nationality)?.toLowerCase()}.svg`;
  const { data, error } = await supabase
    .from("guests")
    .insert([{ fullName, email, nationalID, nationality, countryFlag }])
    .select();

  if (error) throw new Error(error.message);

  return data;
}

export async function getGuests() {
  const { data, error } = await supabase.from("guests").select("*");

  if (error) throw new Error(error.message);

  // console.log(data)
  return data;
}
