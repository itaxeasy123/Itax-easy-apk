import { storage } from './mmkv';



const DRIVING_LICENCE_KEY =
  'DRIVING_LICENCES';



export interface DrivingLicenceItem {
  id: string;
  fileName: string;
  createdAt: string;
  response: any;
}



/* =========================
   SAVE
========================= */

export const saveDrivingLicence =
  (
    data: DrivingLicenceItem
  ): void => {
    try {
      const existing =
        getDrivingLicences();

      existing.unshift(data);

      storage.set(
        DRIVING_LICENCE_KEY,
        JSON.stringify(
          existing
        )
      );
    } catch (error) {
      console.log(
        'SAVE DRIVING LICENCE ERROR:',
        error
      );
    }
  };



/* =========================
   GET ALL
========================= */

export const getDrivingLicences =
  (): DrivingLicenceItem[] => {
    try {
      const data =
        storage.getString(
          DRIVING_LICENCE_KEY
        );

      return data
        ? JSON.parse(data)
        : [];
    } catch (error) {
      console.log(
        'GET DRIVING LICENCE ERROR:',
        error
      );

      return [];
    }
  };



/* =========================
   DELETE SINGLE
========================= */

export const deleteDrivingLicence =
  (
    id: string
  ): void => {
    try {
      const existing =
        getDrivingLicences();

      const filtered =
        existing.filter(
          (
            item:
              DrivingLicenceItem
          ) =>
            item.id !== id
        );

      storage.set(
        DRIVING_LICENCE_KEY,
        JSON.stringify(
          filtered
        )
      );
    } catch (error) {
      console.log(
        'DELETE DRIVING LICENCE ERROR:',
        error
      );
    }
  };



/* =========================
   CLEAR ALL
========================= */

export const clearDrivingLicences =
  (): void => {
    try {
      storage.set(
        DRIVING_LICENCE_KEY,
        JSON.stringify([])
      );
    } catch (error) {
      console.log(
        'CLEAR DRIVING LICENCE ERROR:',
        error
      );
    }
  };