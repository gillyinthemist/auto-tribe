import { sql } from '@vercel/postgres';
import { UserProfile, VehicleDetails, VehicleCard } from './types';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchOwnedVehicles(ownerId: string, filterBy: string) {
  noStore();
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  if (filterBy === 'all') {
    try {
      const vehicles =
        await sql<VehicleCard>`SELECT id, make, model, image FROM vehicles WHERE owner_id = ${ownerId}`;
      return vehicles.rows;
    } catch (error) {
      console.error('Database Error:', error);
    }
  } else {
    try {
      const vehicles =
        await sql<VehicleCard>`SELECT id, make, model, image FROM vehicles WHERE owner_id = ${ownerId} AND current = ${true ? filterBy === '' : false}`;
      return vehicles.rows;
    } catch (error) {
      console.error('Database Error:', error);
    }
  }
}

export async function fetchDiaryEntries(id: string) {
  try {
    const entries = await sql`SELECT * FROM entries WHERE vehicle_id = ${id}`;
    return entries.rows;
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchVehicleByReg(vrm: string) {
  try {
    //query API to see if its a valid reg using UKVD API endpoint and get response
    const res = await fetch(
      `https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleData?v=2&api_nullitems=1&auth_apikey=${process.env.UKVD_API_KEY}&user_tag=&key_VRM=${vrm}`,
    );
    const resJson = await res.json();

    let details = {};
    if (resJson.Response?.StatusCode === 'Success') {
      //Deconstruct response and make an object with result
      const { Make, Model, Colour, YearOfManufacture } =
        resJson.Response.DataItems.VehicleRegistration;
      details = {
        make: Make,
        model: Model,
        colour: Colour,
        year: YearOfManufacture,
      };
    }

    //return result and spread details in
    const result = {
      status: resJson.Response.StatusCode,
      message: resJson.Response.StatusMessage,
      ...details,
    };
    return result;
  } catch (error) {
    console.error('Failed to validate VRM:', error);
  }
}

export async function fetchVehicleById(id: string) {
  try {
    const vehicle =
      await sql<VehicleDetails>`SELECT * FROM vehicles WHERE id = ${id}`;
    return vehicle.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchUserProfileById(id: string) {
  try {
    const user =
      await sql<UserProfile>`SELECT id, first_name, last_name, username, profile_pic FROM users WHERE id = ${id}`;
    return user.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchTaxMot(vrm: string) {
  try {
    //First query API
    const res = await fetch(`
    https://uk1.ukvehicledata.co.uk/api/datapackage/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${process.env.UKVD_API_KEY}&user_tag=&key_VRM=${vrm}`);
    const resJson = await res.json();

    //If not successful, return error
    if (resJson.Response.StatusCode !== 'Success')
      return { error: resJson.Response.StatusMessage };
    else {
      return resJson.Response.DataItems.VehicleStatus;
    }
  } catch (error) {
    console.error(error);
    return {
      error: 'Error occured, Please try again',
    };
  }
}
