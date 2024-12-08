import { Router } from "express";
import { 
    bulkDeleteDonations, 
    bulkDeleteDonors, 
    bulkDeleteFamilies, 
    bulkDeleteItemsDonations, 
    createDonation, 
    createDonor, 
    createFamily, 
    createItemDonation, 
    createPixDonation, 
    deleteDonation, 
    deleteDonor, 
    deleteFamily, 
    deleteItemDonation, 
    deletePixDonation, 
    getDonationById, 
    getDonationsTable, 
    getDonor, 
    getDonorById, 
    getFamilies, 
    getFamilyById, 
    getItemDonationById,
    getItemsDonation, 
    getItemsDonations, 
    getPixDonationById, 
    getToReceiveDonations, 
    updateDonation, 
    updateDonor, 
    updateFamily, 
    updateItemDonation, 
    updatePixDonation 
} from "./controller";
import { allowRoles } from "../auth/middlewares/verify-permissions.middleware";
import { Roles } from "../common/enums/roles";

const router: Router = Router();

/* Families Routes */

router.get('/families', allowRoles([Roles.DONOR_ADMINISTRATOR]), getFamilies);

router.delete('/families', allowRoles([Roles.DONOR_ADMINISTRATOR]), bulkDeleteFamilies);

router.delete('/families/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), deleteFamily);

router.post('/families', allowRoles([Roles.DONOR_ADMINISTRATOR]), createFamily);

router.put('/families/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), updateFamily);

router.get('/families/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), getFamilyById);


/* Donor Routes */

router.get('/donors', allowRoles([Roles.DONOR_ADMINISTRATOR]), getDonor);

router.delete('/donors', allowRoles([Roles.DONOR_ADMINISTRATOR]), bulkDeleteDonors);

router.delete('/donors/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), deleteDonor);

router.post('/donors/', allowRoles([Roles.DONOR_ADMINISTRATOR]), createDonor);

router.put('/donors/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), updateDonor);

router.get('/donors/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), getDonorById);


/* Donations Routes */

router.get('/donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), getDonationsTable);

router.post('/donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), createDonation);

router.delete('/donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), bulkDeleteDonations);

router.delete('/donations/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), deleteDonation);

router.put('/donations/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), updateDonation);

router.get('/donations/toReceive', allowRoles([Roles.DONOR_ADMINISTRATOR]), getToReceiveDonations);

router.get('/donations/:id', allowRoles([Roles.DONOR_ADMINISTRATOR]), getDonationById);

/* Pix Donations Routes */

router.delete('/pix-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), deletePixDonation);

router.post('/pix-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), createPixDonation);

router.put('/pix-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), updatePixDonation);

router.get('/pix-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), getPixDonationById);


/* Items Donations Routes */

router.get('/items-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), getItemsDonations);

router.delete('/items-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), bulkDeleteItemsDonations);

router.delete('/items-donations/:id_donation/:id_product', allowRoles([Roles.DONOR_ADMINISTRATOR]), deleteItemDonation);

router.post('/items-donations', allowRoles([Roles.DONOR_ADMINISTRATOR]), createItemDonation);

router.put('/items-donations/:id_donation/:id_product', allowRoles([Roles.DONOR_ADMINISTRATOR]), updateItemDonation);

router.get('/items-donations/:id_donation/:id_product', allowRoles([Roles.DONOR_ADMINISTRATOR]), getItemDonationById);

router.get('/items-donations/:id_donation', allowRoles([Roles.DONOR_ADMINISTRATOR]), getItemsDonation);

export default router;
