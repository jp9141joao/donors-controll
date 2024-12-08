import { Request, Response } from "express";
import {
    createFamilyRequestBody,
    createDonorRequestBody,
    createDonationsRequestBody,
    createItemsDonationsRequestBody,
    updateFamilyRequestBody,
    updateDonorRequestBody,
    updateDonationsRequestBody,
    updateItemsDonationsRequestBody,
    createPixDonationRequestBody,
    updatePixDonationRequestBody
} from './request'
import prisma from "../../database/driver/prisma";
import bcrypt from "bcrypt";
import { HttpResult } from "../common/models/httpresult.model";
import { Utils } from "../common/utils/utils";
import { Console } from "console";
import { constructNow } from "date-fns";

/* Families Controllers */

export const getFamilies = async (req: Request, res: Response): Promise<void> => {
    try {
        const gotFamilies = await prisma.tb_family.findMany();

        const gotFamiliesFormatted = gotFamilies.map((family: any) => {
            family.id = family.id.toString();
            return family;
        });

        res.status(200).json(HttpResult.success(gotFamiliesFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail('Error loading families'));
    }
}

export const bulkDeleteFamilies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ids } = req.body

        if (!Array.isArray(ids) || ids.length == 0 || ids.some((id: string) => Utils.isBigInt(id) == false) == true) {
            res.status(400).json(HttpResult.Fail("Error the families IDs are invalid or was not provided correctly"));
            return;
        }

        const doThoseFamiliesExist = (await prisma.tb_family.count({
            where: {
                id: {
                    in: ids,
                }
            }
        })) == ids.length ? true : false;

        if (!doThoseFamiliesExist) {
            res.status(400).json(HttpResult.Fail("Error there are one or more families that do not exist in array"));
            return;
        }

        const deletedFamilies = await prisma.tb_family.deleteMany({
            where: {
                id: {
                    in: ids
                },
            }
        });

        res.status(200).json(HttpResult.success(deletedFamilies.count));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting families"))
    }
}

export const deleteFamily = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of family ID is invalid or was not provided correctly"));
            return;
        }

        const doesFamilyExist = (await prisma.tb_family.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesFamilyExist) {
            res.status(400).json(HttpResult.Fail("Error family does not exist"));
            return;
        }

        await prisma.tb_family.delete({
            where: {
                id: BigInt(id),
            }
        })

        res.status(200).json(HttpResult.success("Family deleted successfully"));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting family"))
    }
}

export const createFamily = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newFamilyData } = req.body as createFamilyRequestBody;

        if (Utils.isNullOrEmpty(newFamilyData.family_name)) {
            res.status(400).json(HttpResult.Fail("Error the value of family name is invalid"));
            return;
        } else if (newFamilyData.family_name.length > 50) {
            res.status(400).json(HttpResult.Fail("Error the value of family name is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newFamilyData.family_responsible_name)) {
            res.status(400).json(HttpResult.Fail("Error the value of family responsible name is invalid"));
            return;
        } else if (newFamilyData.family_responsible_name.length > 50) {
            res.status(400).json(HttpResult.Fail("Error the value of family responsible name is too large"));
            return;
        }

        if (newFamilyData.number_members != undefined && newFamilyData.number_members <= 0) {
            res.status(400).json(HttpResult.Fail("Error the value of number member is less than or equal to zero"));
            return;
        }

        if (newFamilyData.withdraw_donations == undefined || typeof newFamilyData.withdraw_donations != "boolean") {
            res.status(400).json(HttpResult.Fail("Error the value of withdraw donations is invalid"));
            return;
        }

        if (newFamilyData.cep) {
            if (newFamilyData.cep.length > 8) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is too large"));
                return;
            } else if (!Utils.isValidCep(newFamilyData.cep)) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is invalid"));
                return;
            }

            newFamilyData.cep = Utils.removeFormattingCep(newFamilyData.cep);
        }

        if (newFamilyData.city && newFamilyData.city.length > 60) {
            res.status(400).json(HttpResult.Fail("Error the value of city is too large"));
            return;
        }

        if (newFamilyData.street && newFamilyData.street.length > 60) {
            res.status(400).json(HttpResult.Fail("Error the value of street is too large"));
            return;
        }

        if (newFamilyData.house_number && newFamilyData.house_number.length > 6) {
            res.status(400).json(HttpResult.Fail("Error the value of house number is too large"));
            return;
        }

        if (newFamilyData.neighborhood && newFamilyData.neighborhood.length > 60) {
            res.status(400).json(HttpResult.Fail("Error the value of neighborhood is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newFamilyData.email)) {
            res.status(400).json(HttpResult.Fail("Error the value of email is invalid"));
            return;
        } else if (newFamilyData.email.length > 255) {
            res.status(400).json(HttpResult.Fail("Error the value of email is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newFamilyData.phone) || !Utils.isValidPhone(newFamilyData.phone)) {
            res.status(400).json(HttpResult.Fail("Error the value of phone name is invalid"));
            return;
        } else if (newFamilyData.phone.length > 20) {
            res.status(400).json(HttpResult.Fail("Error the value of phone is too large"));
            return;
        }

        const isThereAFamilyUsingThisEmail: boolean = await prisma.tb_family.count({
            where: {
                email: newFamilyData.email,
            }
        }) > 0 ? true : false;

        if (isThereAFamilyUsingThisEmail == true) {
            res.status(400).json(HttpResult.Fail("Error a family already using this email"));
            return;
        }

        const isThereAFamilyUsingThisPhone: boolean = await prisma.tb_family.count({
            where: {
                phone: newFamilyData.phone,
            }
        }) > 0 ? true : false;

        if (isThereAFamilyUsingThisPhone == true) {
            res.status(400).json(HttpResult.Fail("Error a family already using this phone number"));
            return;
        }

        const createdFamily = await prisma.tb_family.create({
            data: {
                family_name: newFamilyData.family_name,
                family_responsible_name: newFamilyData.family_responsible_name,
                number_members: newFamilyData.number_members,
                withdraw_donations: newFamilyData.withdraw_donations,
                cep: newFamilyData.cep,
                city: newFamilyData.city,
                street: newFamilyData.street,
                house_number: newFamilyData.house_number,
                neighborhood: newFamilyData.neighborhood,
                email: newFamilyData.email,
                phone: newFamilyData.phone
            }
        });

        const createdFamilyFormatted = {
            ...createdFamily,
            id: createdFamily.id.toString()
        }

        res.status(200).json(HttpResult.success(createdFamilyFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail('Error create family'));
    }
}

export const updateFamily = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newFamilyData } = req.body as updateFamilyRequestBody;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of family ID is invalid or was not provided correctly"));
            return;
        }

        const doesFamilyExist = (await prisma.tb_family.count({
            where: {
                id: Number(id),
            }
        })) == 1 ? true : false;

        if (!doesFamilyExist) {
            res.status(400).json(HttpResult.Fail("Error family does not exist"));
            return;
        }

        const auxFamily: any = {};

        if (newFamilyData.family_name) {
            if (newFamilyData.family_name.length > 50) {
                res.status(400).json(HttpResult.Fail("Error the value of family name is too large"));
                return;
            }

            auxFamily.family_name = newFamilyData.family_name;
        }

        if (newFamilyData.family_responsible_name) {
            if (newFamilyData.family_responsible_name.length > 50) {
                res.status(400).json(HttpResult.Fail("Error the value of family responsible name is too large"));
                return;
            }

            auxFamily.family_responsible_name = newFamilyData.family_responsible_name;
        }

        if (newFamilyData.number_members != undefined) {
            if (newFamilyData.number_members <= 0) {
                res.status(400).json(HttpResult.Fail("Error the value of number member is less than or equal to zero"));
                return;
            }

            auxFamily.number_members = newFamilyData.number_members;
        }

        if (newFamilyData.withdraw_donations == undefined || typeof newFamilyData.withdraw_donations != "boolean") {
            res.status(400).json(HttpResult.Fail("Error the value of withdraw donations is invalid"));
            return;
        }

        if (newFamilyData.cep) {
            if (newFamilyData.cep.length > 8) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is too large"));
                return;
            } else if (!Utils.isValidCep(newFamilyData.cep)) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is invalid"));
                return;
            }

            auxFamily.cep = Utils.removeFormattingCep(newFamilyData.cep);
        }

        if (newFamilyData.city) {
            if (newFamilyData.city.length > 60) {
                res.status(400).json(HttpResult.Fail("Error the value of city is too large"));
                return;
            }

            auxFamily.city = newFamilyData.city;
        }

        if (newFamilyData.street) {
            if (newFamilyData.street.length > 60) {
                res.status(400).json(HttpResult.Fail("Error the  value of street is too large"));
                return;
            }

            auxFamily.street = newFamilyData.street;
        }

        if (newFamilyData.house_number) {
            if (newFamilyData.house_number.length > 6) {
                res.status(400).json(HttpResult.Fail("Error the value of house number is too large"));
                return;
            }

            auxFamily.house_number = newFamilyData.house_number;
        }

        if (newFamilyData.neighborhood) {
            if (newFamilyData.neighborhood.length > 60) {
                res.status(400).json(HttpResult.Fail("Error the value of neighborhood is too large"));
                return;
            }

            auxFamily.neighborhood = newFamilyData.neighborhood;
        }

        if (newFamilyData.email) {
            if (newFamilyData.email.length > 255) {
                res.status(400).json(HttpResult.Fail("Error the value of email is too large"));
                return;
            }

            auxFamily.email = newFamilyData.email;
        }

        const dataFamily = await prisma.tb_family.findFirst({
            where: {
                id: BigInt(id),
            }
        }); 

        if (newFamilyData.phone) {
            if (newFamilyData.phone.length > 20) {
                res.status(400).json(HttpResult.Fail("Error the value of phone is too large"));
                return;
            } else if (!Utils.isValidPhone(newFamilyData.phone)) {
                res.status(400).json(HttpResult.Fail("Error the value of phone is too large"));
                return;
            }

            auxFamily.phone = Utils.removeFormattingPhone(newFamilyData.phone);
        }

        if (auxFamily.email) {
            if (dataFamily?.email != newFamilyData.email) {
                const isThereAFamilyUsingThisEmail: boolean = await prisma.tb_family.count({
                    where: {
                        email: newFamilyData.email,
                    }
                }) > 0 ? true : false;
        
                if (isThereAFamilyUsingThisEmail == true) {
                    res.status(400).json(HttpResult.Fail("Error a family already using this email"));
                    return;
                }
            }
        }

        if (auxFamily.phone) {
            if (dataFamily?.phone != newFamilyData.phone) {
                const isThereAFamilyUsingThisPhone: boolean = await prisma.tb_family.count({
                    where: {
                        phone: newFamilyData.phone,
                    }
                }) > 0 ? true : false;
        
                if (isThereAFamilyUsingThisPhone == true) {
                    res.status(400).json(HttpResult.Fail("Error a family already using this phone number"));
                    return;
                }
            }
        }

        const updatedFamily = await prisma.tb_family.update({
            where: {
                id: BigInt(id),
            },
            data: auxFamily,
        });

        const updatedFamilyFormatted = {
            ...updatedFamily,
            id: updatedFamily.id.toString(),
        }

        res.status(200).json(HttpResult.success(updatedFamilyFormatted));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error updating family"));
    }
}

export const getFamilyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of family ID is invalid or was not provided correctly"));
            return;
        }

        const doesFamilyExist = (await prisma.tb_family.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesFamilyExist) {
            res.status(400).json(HttpResult.Fail("Error family does not exist"));
            return;
        }

        const gotFamily = await prisma.tb_family.findUnique({
            where: {
                id: BigInt(id),
            }
        });

        const gotFamilyFormatted = {
            ...gotFamily,
            id: gotFamily?.id.toString()
        }

        res.status(200).json(HttpResult.success(gotFamilyFormatted));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error loading family by ID"));
    }
}

/* Donors Controllers */

export const getDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const gotDonors = await prisma.tb_donor.findMany({
            include: {
                tb_donor_enterprise: true,
            }
        });

        const gotDonorsFormatted = gotDonors.map((donor: any) => {
            donor.id = donor.id.toString();
            donor.id_enterprise ?
                donor.id_enterprise = donor.id_enterprise.toString()
                : null;
            donor.tb_donor_enterprise ?
                donor.tb_donor_enterprise.id = donor.tb_donor_enterprise.id.toString()
                : null;
            return donor;
        });

        res.status(200).json(HttpResult.success(gotDonorsFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error loading donors"));
    }
}

export const bulkDeleteDonors = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length == 0 || ids.some((id: string) => Utils.isBigInt(id) == false) == true) {
            res.status(400).json(HttpResult.Fail("Error the donors IDs are invalid or was not provided correctly"));
            return;
        }

        const doThoseDonorsExist = (await prisma.tb_donor.count({
            where: {
                id: {
                    in: ids,
                }
            }
        })) == ids.length ? true : false;

        if (!doThoseDonorsExist) {
            res.status(400).json(HttpResult.Fail("Error there are one or more donors that do not exist in array"));
            return;
        }

        const deletedDonors = await prisma.tb_donor.deleteMany({
            where: {
                id: {
                    in: ids
                },
            },
        });

        res.status(200).json(HttpResult.success(deletedDonors.count));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting donors"));
    }
}

export const deleteDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of donor ID is invalid or was not provided correctly"));
            return;
        }

        const doesDonorExist = (await prisma.tb_donor.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesDonorExist) {
            res.status(400).json(HttpResult.Fail("Error donor does not exist"));
            return;
        }

        await prisma.tb_donor.delete({
            where: {
                id: BigInt(id),
            }
        })

        res.status(200).json(HttpResult.success("Donor deleted successfully"));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting donor"))
    }
}

export const createDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newDonorData, newDonorEnterpriseData } = req.body as createDonorRequestBody;

        if (Utils.isNullOrEmpty(newDonorData.email)) {
            res.status(400).json(HttpResult.Fail("Error the value of email is invalid"));
            return;
        } else if (newDonorData.email.length > 255) {
            res.status(400).json(HttpResult.Fail("Error the value of email is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newDonorData.password)) {
            res.status(400).json(HttpResult.Fail("Error the value of password is invalid"));
            return;
        } else if (newDonorData.password.length > 255) {
            res.status(400).json(HttpResult.Fail("Error the value of password is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newDonorData.donation_period)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation period is invalid"));
            return;
        } else if (newDonorData.donation_period.length > 20) {
            res.status(400).json(HttpResult.Fail("Error the value of donation period is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newDonorData.donor_type)) {
            res.status(400).json(HttpResult.Fail("Error the value of donor type is invalid"));
            return;
        } else if (newDonorData.donor_type.length > 1) {
            res.status(400).json(HttpResult.Fail("Error the value of donor type is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newDonorData.name)) {
            res.status(400).json(HttpResult.Fail("Error the value of name is invalid"));
            return;
        } else if (newDonorData.name.length > 100) {
            res.status(400).json(HttpResult.Fail("Error the value of name is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newDonorData.phone) || !Utils.isValidPhone(newDonorData.phone)) {
            res.status(400).json(HttpResult.Fail("Error the value of phone is invalid"));
            return;
        } else if (newDonorData.phone.length > 20) {
            res.status(400).json(HttpResult.Fail("Error the value of phone is too large"));
            return;
        } else {
            newDonorData.phone = Utils.removeFormattingPhone(newDonorData.phone);
        }

        if (newDonorData.social_network && newDonorData.social_network.length > 50) {
            res.status(400).json(HttpResult.Fail("Error the value of social network is too large"));
            return;
        }


        if (newDonorData.birth_date) {
            const currentDate = new Date().getTime();
            const birth_date = new Date(newDonorData.birth_date).getTime();

            if (!Utils.isDateValid(newDonorData.birth_date)) {
                res.status(400).json(HttpResult.Fail("Error the value of birth date is invalid"));
                return;
            } else if (birth_date > currentDate) {
                res.status(400).json(HttpResult.Fail("Error the value of donation date is in the future"));
                return;
            }

            newDonorData.birth_date = new Date(newDonorData.birth_date);
        }

        const dataDonor: any = {
            id_enterprise: undefined,
            email: newDonorData.email,
            password: await bcrypt.hash(newDonorData.password, 10),
            donation_period: newDonorData.donation_period,
            donor_type: newDonorData.donor_type,
            name: newDonorData.name,
            phone: newDonorData.phone,
            social_network: newDonorData.social_network,
            birth_date: newDonorData.birth_date
        }

        const dataDonorEnterprise: any = {};

        if (newDonorEnterpriseData) {

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.responsible_name)) {
                res.status(400).json(HttpResult.Fail("Error the value of resposible name is invalid"));
                return;
            } else if (newDonorEnterpriseData.responsible_name.length > 100) {
                res.status(400).json(HttpResult.Fail("Error the value of resposible name is too large"));
                return;
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.enterprise_name)) {
                res.status(400).json(HttpResult.Fail("Error the value of enterprise name is invalid"));
                return;
            } else if (newDonorEnterpriseData.enterprise_name.length > 100) {
                res.status(400).json(HttpResult.Fail("Error the value of enterprise name is too large"));
                return;
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.cnpj) || !Utils.isValidCnpj(newDonorEnterpriseData.cnpj)) {
                res.status(400).json(HttpResult.Fail("Error the value of cnpj is invalid"));
                return;
            } else if (newDonorEnterpriseData.cnpj.length > 14) {
                res.status(400).json(HttpResult.Fail("Error the value of cnpj is too large"));
                return;
            } else {
                newDonorEnterpriseData.cnpj = Utils.removeFormattingCnpj(newDonorEnterpriseData.cnpj);
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.cep) || !Utils.isValidCep(newDonorEnterpriseData.cep)) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is invalid"));
                return;
            } else if (newDonorEnterpriseData.cep.length > 8) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is too large"));
                return;
            } else {
                newDonorEnterpriseData.cep = Utils.removeFormattingCep(newDonorEnterpriseData.cep);
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.city)) {
                res.status(400).json(HttpResult.Fail("Error the value of city is invalid"));
                return;
            } else if (newDonorEnterpriseData.city.length > 60) {
                res.status(400).json(HttpResult.Fail("Error the value of city is too large"));
                return;
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.street)) {
                res.status(400).json(HttpResult.Fail("Error the value of street is invalid"));
                return;
            } else if (newDonorEnterpriseData.street.length > 60) {
                res.status(400).json(HttpResult.Fail("Error the value of street is too large"));
                return;
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.enterprise_number)) {
                res.status(400).json(HttpResult.Fail("Error the value of enterprise number is invalid"));
                return;
            } else if (newDonorEnterpriseData.enterprise_number.length > 6) {
                res.status(400).json(HttpResult.Fail("Error the value of enterprise number is too large"));
                return;
            }

            if (Utils.isNullOrEmpty(newDonorEnterpriseData.neighborhood)) {
                res.status(400).json(HttpResult.Fail("Error the value of neighborhood is invalid"));
                return;
            } else if (newDonorEnterpriseData.neighborhood.length > 100) {
                res.status(400).json(HttpResult.Fail("Error the value of neighborhood is too large"));
                return;
            }

            dataDonorEnterprise.responsible_name = newDonorEnterpriseData.responsible_name;
            dataDonorEnterprise.enterprise_name = newDonorEnterpriseData.enterprise_name;
            dataDonorEnterprise.cnpj = newDonorEnterpriseData.cnpj;
            dataDonorEnterprise.cep = newDonorEnterpriseData.cep;
            dataDonorEnterprise.city = newDonorEnterpriseData.city;
            dataDonorEnterprise.street = newDonorEnterpriseData.street;
            dataDonorEnterprise.enterprise_number = newDonorEnterpriseData.enterprise_number;
            dataDonorEnterprise.neighborhood = newDonorEnterpriseData.neighborhood;
        }

        const isThereADonorUsingThisEmail: boolean = await prisma.tb_donor.count({
            where: {
                email: newDonorData.email,
            }
        }) > 0 ? true : false;

        if (isThereADonorUsingThisEmail == true) {
            res.status(400).json(HttpResult.Fail("Error a donor already using this email"));
            return;
        }

        const isThereADonorUsingThisPhone: boolean = await prisma.tb_donor.count({
            where: {
                phone: newDonorData.phone,
            }
        }) > 0 ? true : false;

        if (isThereADonorUsingThisPhone == true) {
            res.status(400).json(HttpResult.Fail("Error a donor already using this phone number"));
            return;
        }

        let isThereADonorEnterpriseUsingThisCnpj: boolean = false;

        if (Object.keys(dataDonorEnterprise).length != 0) {
            isThereADonorEnterpriseUsingThisCnpj = (await prisma.tb_donor_enterprise.count({
                where: {
                    cnpj: newDonorEnterpriseData?.cnpj
                }
            })) > 0 ? true : false;
        }

        if (isThereADonorEnterpriseUsingThisCnpj) {
            res.status(400).json(HttpResult.Fail("Error a donor already using this cnpj"));
            return
        }

        if (Object.keys(dataDonorEnterprise).length == 0) {
            const createdDonor = await prisma.tb_donor.create({
                data: dataDonor
            });

            const createdDonorFormatted = {
                ...createdDonor,
                id: createdDonor.id.toLocaleString(),
            };

            res.status(200).json(HttpResult.success(createdDonorFormatted))
        } else {
            const createdDonorEnterprise = await prisma.tb_donor_enterprise.create({
                data: dataDonorEnterprise
            });

            dataDonor.id_enterprise = createdDonorEnterprise.id;

            const createdDonor = await prisma.tb_donor.create({
                data: dataDonor,
                include: {
                    tb_donor_enterprise: true
                }
            });

            const createdDonorFormatted = {
                ...createdDonor,
                id: createdDonor.id.toString(),
                id_enterprise: createdDonor.id_enterprise?.toString(),
                tb_donor_enterprise: {
                    ...createdDonor.tb_donor_enterprise,
                    id: createdDonor.tb_donor_enterprise?.id.toString(),
                }
            }

            res.status(200).json(HttpResult.success(createdDonorFormatted));
        }
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error creating donor"));
    }
}

export const updateDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newDonorData, newDonorEnterpriseData } = req.body as updateDonorRequestBody;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of donor ID is invalid or was not provided correctly"));
            return;
        }

        const doesDonorExist = (await prisma.tb_donor.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesDonorExist) {
            res.status(400).json(HttpResult.Fail("Error donor does not exist"));
            return
        }

        const dataDonor: any = {};
        const dataDonorEnterprise: any = {};

        if (newDonorData.email) {
            if (newDonorData.email.length > 255) {
                res.status(400).json(HttpResult.Fail("Error the value of email is too large"));
                return;
            }

            dataDonor.email = newDonorData.email;
        }

        if (newDonorData.password) {
            if (newDonorData.password.length > 255) {
                res.status(400).json(HttpResult.Fail("Error the value of password is too large"));
                return;
            }

            dataDonor.password = await bcrypt.hash(newDonorData.password, 10);
        }

        if (newDonorData.donation_period) {
            if (newDonorData.donation_period.length > 20) {
                res.status(400).json(HttpResult.Fail("Error the value of donation period is too large"));
                return;
            }

            dataDonor.donation_period = newDonorData.donation_period;
        }

        if (newDonorData.donor_type) {
            if (newDonorData.donor_type.length > 1) {
                res.status(400).json(HttpResult.Fail("Error the value of donor type is too large"));
                return;
            }

            dataDonor.donor_type = newDonorData.donor_type;
        }

        if (newDonorData.name) {
            if (newDonorData.name.length > 100) {
                res.status(400).json(HttpResult.Fail("Error the value of name is too large"));
                return;
            }

            dataDonor.name = newDonorData.name;
        }
        if (newDonorData.phone) {
            if (newDonorData.phone.length > 20) {
                res.status(400).json(HttpResult.Fail("Error the value of phone is too large"));
                return;
            } else if (!Utils.isValidPhone(newDonorData.phone)) {
                res.status(400).json(HttpResult.Fail("Error the value of phone is invalid"));
                return;
            }

            dataDonor.phone = Utils.removeFormattingPhone(newDonorData.phone);
        }

        if (newDonorData.social_network) {
            if (newDonorData.social_network.length > 50) {
                res.status(400).json(HttpResult.Fail("Error the value of social network is too large"));
                return;
            }

            dataDonor.social_network = newDonorData.social_network;
        }

        const auxDonor = (await prisma.tb_donor.findUnique({
            where: {
                id: BigInt(id),
            },
            include: {
                tb_donor_enterprise: true
            }
        }))

        if (newDonorData.birth_date && auxDonor?.birth_date) {
            const currentDate = new Date(auxDonor.birth_date).getTime();
            const birth_date = new Date(newDonorData.birth_date).getTime();

            if (currentDate != birth_date) {
                if (!Utils.isDateValid(newDonorData.birth_date)){
                    res.status(400).json(HttpResult.Fail("Error the value of birth date is invalid"));
                    return;
                } else if (birth_date > currentDate) {
                    res.status(400).json(HttpResult.Fail("Error the value of donation date is in the future"));
                    return;
                }
        
                newDonorData.birth_date = new Date(newDonorData.birth_date);
                dataDonor.birth_date = new Date(newDonorData.birth_date);
            }
        }
            
        if (newDonorEnterpriseData) {
            if (newDonorEnterpriseData.responsible_name) {
                if (newDonorEnterpriseData.responsible_name.length > 100) {
                    res.status(400).json(HttpResult.Fail("Error the value of resposible name is too large"));
                    return;
                }

                dataDonorEnterprise.responsible_name = newDonorEnterpriseData.responsible_name;
            }

            if (newDonorEnterpriseData.enterprise_name) {
                if (newDonorEnterpriseData.enterprise_name.length > 100) {
                    res.status(400).json(HttpResult.Fail("Error the value of enterprise name is too large"));
                    return;
                }

                dataDonorEnterprise.enterprise_name = newDonorEnterpriseData.enterprise_name;
            }

            if (newDonorEnterpriseData.cnpj) {
                if (newDonorEnterpriseData.cnpj.length > 14) {
                    res.status(400).json(HttpResult.Fail("Error the value of cnpj is too large"));
                    return;
                } else if (!Utils.isValidCnpj(newDonorEnterpriseData.cnpj)) {
                    res.status(400).json(HttpResult.Fail("Error the value of cnpj is invalid"));
                    return;
                }

                dataDonorEnterprise.cnpj = Utils.removeFormattingCnpj(newDonorEnterpriseData.cnpj);
            }

            if (newDonorEnterpriseData.cep) {
                if (newDonorEnterpriseData.cep.length > 8) {
                    res.status(400).json(HttpResult.Fail("Error the value of cep is too large"));
                    return;
                } else if (!Utils.isValidCep(newDonorEnterpriseData.cep)) {
                    res.status(400).json(HttpResult.Fail("Error the value of cep is invalid"));
                    return;
                }

                dataDonorEnterprise.cep = Utils.removeFormattingCep(newDonorEnterpriseData.cep);
            }

            if (newDonorEnterpriseData.city) {
                if (newDonorEnterpriseData.city.length > 60) {
                    res.status(400).json(HttpResult.Fail("Error the value of city is too large"));
                    return;
                }

                dataDonorEnterprise.city = newDonorEnterpriseData.city;
            }

            if (newDonorEnterpriseData.street) {
                if (newDonorEnterpriseData.street.length > 60) {
                    res.status(400).json(HttpResult.Fail("Error the value of street is too large"));
                    return;
                }

                dataDonorEnterprise.street = newDonorEnterpriseData.street;
            }

            if (newDonorEnterpriseData.enterprise_number) {
                if (newDonorEnterpriseData.enterprise_number.length > 6) {
                    res.status(400).json(HttpResult.Fail("Error the value of enterprise number is too large"));
                    return;
                }

                dataDonorEnterprise.enterprise_number = newDonorEnterpriseData.enterprise_number;
            }

            if (newDonorEnterpriseData.neighborhood) {
                if (newDonorEnterpriseData.neighborhood.length > 100) {
                    res.status(400).json(HttpResult.Fail("Error the value of neighborhood is too large"));
                    return;
                }

                dataDonorEnterprise.neighborhood = newDonorEnterpriseData.neighborhood;
            }
        }

        if (dataDonor.email) {
            if (auxDonor?.email != newDonorData.email) {
                const isThereADonorUsingThisEmail: boolean = await prisma.tb_donor.count({
                    where: {
                        email: newDonorData.email,
                    }
                }) > 0 ? true : false;
        
                if (isThereADonorUsingThisEmail == true) {
                    res.status(400).json(HttpResult.Fail("Error a donor already using this email"));
                    return;
                }
            }
        }

        if (dataDonor.phone) {
            if (auxDonor?.phone != newDonorData.phone) {
                const isThereADonorUsingThisPhone: boolean = await prisma.tb_donor.count({
                    where: {
                        phone: newDonorData.phone,
                    }
                }) > 0 ? true : false;
        
                if (isThereADonorUsingThisPhone == true) {
                    res.status(400).json(HttpResult.Fail("Error a donor already using this phone number"));
                    return;
                }
            }
        }
        
        if (dataDonorEnterprise.cnpj) {
            if (auxDonor?.tb_donor_enterprise?.cnpj != newDonorEnterpriseData?.cnpj) {
                let isThereADonorEnterpriseUsingThisCnpj: boolean = false;

                if(Object.keys(dataDonorEnterprise).length != 0) {
                    isThereADonorEnterpriseUsingThisCnpj = (await prisma.tb_donor_enterprise.count({
                        where: {
                            cnpj: newDonorEnterpriseData?.cnpj
                        }
                    })) > 0 ? true : false;
                }

                if (isThereADonorEnterpriseUsingThisCnpj) {
                    res.status(400).json(HttpResult.Fail("Error a donor already using this cnpj"));
                    return
                }
            }
        }

        if (auxDonor?.tb_donor_enterprise == null && Object.keys(dataDonorEnterprise).length != 0) {
            res.status(400).json(HttpResult.Fail("Error a donor cannot be updated to become a donor enterprise"));
            return;
        }

        if (auxDonor?.tb_donor_enterprise == null) {
            const updatedDonor = await prisma.tb_donor.update({
                where: {
                    id: BigInt(id),
                },
                data: dataDonor
            });

            const updatedDonorFormatted = {
                ...updatedDonor,
                id: updatedDonor.id.toLocaleString(),
            };

            res.status(200).json(HttpResult.success(updatedDonorFormatted));
        } else if (auxDonor.tb_donor_enterprise != null && auxDonor.id_enterprise) {
            await prisma.tb_donor_enterprise.update({
                where: { 
                    id: BigInt(auxDonor.id_enterprise), 
                },
                data: dataDonorEnterprise,
            });

            const updatedDonor = await prisma.tb_donor.update({
                where: {
                    id: BigInt(id),
                },
                data: dataDonor,
                include: {
                    tb_donor_enterprise: true,
                }
            });

            const updatedDonorFormatted = {
                ...updatedDonor,
                id: updatedDonor.id.toString(),
                id_enterprise: updatedDonor.id_enterprise?.toString(),
                tb_donor_enterprise: {
                    ...updatedDonor.tb_donor_enterprise,
                    id: updatedDonor.tb_donor_enterprise?.id.toString(),
                }
            }

            res.status(200).json(HttpResult.success(updatedDonorFormatted));
        }
    } catch (error: any) {
        console.error(error)
        res.status(404).json(HttpResult.Fail("Error updating donor"));
    }
}    

export const getDonorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of donor ID is invalid or was not provided correctly"));
            return;
        }

        const doesDonorExist = (await prisma.tb_donor.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesDonorExist) {
            res.status(400).json(HttpResult.Fail("Error donor does not exist"));
            return
        }

        const gotDonor = await prisma.tb_donor.findUnique({
            where: {
                id: BigInt(id),
            },
            include: {
                tb_donor_enterprise: true,
            }
        });

        const gotDonorFormatted = {
            ...gotDonor,
            id: gotDonor?.id.toString(),
            id_enterprise: gotDonor?.id_enterprise?.toString(),
            tb_donor_enterprise: {
                ...gotDonor?.tb_donor_enterprise,
                id: gotDonor?.tb_donor_enterprise?.id.toString(),
            }
        }

        res.status(200).json(HttpResult.success(gotDonorFormatted));
    } catch (error: any) {
        //res.status(404).json(HttpResult.Fail("Error loading donor by ID"));
        res.status(404).json(console.log(error));
    }
}

/* Donations Controllers*/

export const getDonationsTable = async (req: Request, res: Response): Promise<void> => {
    try {
        const gotDonations = await prisma.tb_donations.findMany();

        const gotDonationsFormatted = gotDonations.map((donation: any) => {
            donation.id = donation.id.toString();
            donation.id_donor = donation.id_donor.toString();
            return donation;
        });

        res.status(200).json(HttpResult.success(gotDonationsFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error loading donations"));
    }
}

export const bulkDeleteDonations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length == 0 || ids.some((id: string) => Utils.isBigInt(id) == false) == true) {
            res.status(400).json(HttpResult.Fail("Error the donations IDs are invalid or was not provided correctly"));
            return;
        }

        const doThoseDonationsExist = (await prisma.tb_donations.count({
            where: {
                id: {
                    in: ids,
                }
            }
        })) == ids.length ? true : false;

        if (!doThoseDonationsExist) {
            res.status(400).json(HttpResult.Fail("Error there are  one or more donations that do not exist in array"));
            return;
        }

        const deletedDonations = await prisma.tb_donations.deleteMany({
            where: {
                id: {
                    in: ids,
                }
            }
        });

        res.status(200).json(HttpResult.success(deletedDonations.count));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting donations"));
    }
}

export const deleteDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID is invalid or was not provided correctly"));
            return;
        }

        const doesDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesDonationExist) {
            res.status(400).json(HttpResult.Fail("Error donation does not exist"));
            return;
        }

        await prisma.tb_donations.delete({
            where: {
                id: BigInt(id),
            }
        });

        res.status(200).json(HttpResult.success("Donations deleted successfully"));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting donation"))
    }
}

export const createDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newDonationData } = req.body as createDonationsRequestBody;

        if (Utils.isNullOrEmpty(newDonationData.id_donor) || !Utils.isBigInt(newDonationData.id_donor)) {
            res.status(400).json(HttpResult.Fail("Error the value of ID donor is invalid"));
            return;
        }

        newDonationData

        const doesDonorExist = (await prisma.tb_donor.count({
            where: {
                id: newDonationData.id_donor,
            }
        })) == 1 ? true : false;

        if (!doesDonorExist) {
            res.status(400).json(HttpResult.Fail("Error donor does not exist"));
            return
        }

        if (Utils.isNullOrEmpty(newDonationData.donation_type)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation type is invalid"));
            return;
        } else if (newDonationData.donation_type.length > 1) {
            res.status(400).json(HttpResult.Fail("Error the value of donation type is invalid"));
            return;
        }

        if (newDonationData.donation_date) {
            if (!Utils.isDateValid(newDonationData.donation_date)){
                res.status(400).json(HttpResult.Fail("Error the value of donation date is invalid"));
                return;
            }

            newDonationData.donation_date = new Date(newDonationData.donation_date);
        }

        if (newDonationData.scheduled_date) {
            if (!Utils.isDateValid(newDonationData.scheduled_date)){
                res.status(400).json(HttpResult.Fail("Error the value of scheduled date is invalid"));
                return;
            }

            newDonationData.scheduled_date = new Date(newDonationData.scheduled_date);
        }

        if (newDonationData.donation_value != undefined && newDonationData.donation_value <= 0) {
            res.status(400).json(HttpResult.Fail("Error the value of donation value is less than or equal to zero"));
            return;
        }

        if (newDonationData.donation_received == undefined || typeof newDonationData.donation_received != "boolean") {
            res.status(400).json(HttpResult.Fail("Error the value of donation received is invalid"));
            return;
        }

        const createdDonation = await prisma.tb_donations.create({
            data: {
                id_donor: BigInt(newDonationData.id_donor),
                donation_type: newDonationData.donation_type,
                donation_date: newDonationData.donation_date,
                scheduled_date: newDonationData.scheduled_date,
                donation_value: newDonationData.donation_value,
                donation_received: newDonationData.donation_received,
            }
        });

        const createdDonationFormatted = {
            ...createdDonation,
            id: createdDonation.id.toString(),
            id_donor: createdDonation.id_donor.toString(),
        }

        res.status(200).json(HttpResult.success(createdDonationFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error creating donation"));
    }
}

export const updateDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newDonationData } = req.body as updateDonationsRequestBody;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID is invalid or was not provided correctly"));
            return;
        }

        const doesDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesDonationExist) {
            res.status(400).json(HttpResult.Fail("Error donation does not exist"));
            return;
        }

        const auxDonation: any = {}

        if (newDonationData.id_donor) {

            if (Utils.isBigInt(newDonationData.id_donor)) {

                const doesDonorExist = (await prisma.tb_donor.count({
                    where: {
                        id: newDonationData.id_donor,
                    }
                })) == 1 ? true : false;

                if (!doesDonorExist) {
                    res.status(400).json(HttpResult.Fail("Error the value of ID donor does not exist"));
                    return;
                }

                auxDonation.id_donor = newDonationData.id_donor;
            } else {
                res.status(400).json(HttpResult.Fail("Error the value of donor ID is invalid or was not provided correctly"));
                return;
            }
        }

        if (newDonationData.donation_type) {
            if (newDonationData.donation_type?.length > 1) {
                res.status(400).json(HttpResult.Fail("Error the value of donation type is too large"));
                return;
            }

            auxDonation.donation_type = newDonationData.donation_type;
        }

        if (newDonationData.donation_date) {
            if (!Utils.isDateValid(newDonationData.donation_date)) {
                res.status(400).json(HttpResult.Fail("Error the value of donation date is invalid"));
                return;
            } 

            auxDonation.donation_date = new Date(newDonationData.donation_date);
        }

        if (newDonationData.scheduled_date) {
            if (!Utils.isDateValid(newDonationData.scheduled_date)) {
                res.status(400).json(HttpResult.Fail("Error the value of scheduled date is invalid"));
                return;
            }

            auxDonation.scheduled_date = new Date(newDonationData.scheduled_date);
        }

        if (newDonationData.donation_value) {
            if (newDonationData.donation_value <= 0) {
                res.status(400).json(HttpResult.Fail("Error the value of donation value is less than or equal to zero"));
                return;
            }

            auxDonation.donation_value = newDonationData.donation_value;
        }

        if (newDonationData.donation_received != undefined) {
            if (typeof newDonationData.donation_received != "boolean") {
                res.status(400).json(HttpResult.Fail("Error the value of donation received is invalid"));
                return;
            }

            auxDonation.donation_received = newDonationData.donation_received;
        }

        const updatedDonation = await prisma.tb_donations.update({
            where: {
                id: BigInt(id),
            },
            data: auxDonation,
        })

        const updatedDonationFormatted = {
            ...updatedDonation,
            id: updatedDonation.id.toString(),
            id_donor: updatedDonation.id_donor.toString(),
        }

        res.status(200).json(HttpResult.success(updatedDonationFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error updating donation"));
    }
}

export const getToReceiveDonations = async (req: Request, res: Response): Promise<void> => {
    try {
        const gotToReceiveDonations = await prisma.tb_donations.findMany({
            where: {
                donation_received: false,
            }
        });

        const gotToReceiveDonationsFormatted = gotToReceiveDonations.map((donation: any) => {
            donation.id = donation.id.toString();
            donation.id_donor = donation.id_donor.toString();
            return donation;
        });

        res.status(200).json(HttpResult.success(gotToReceiveDonationsFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error loading to receive donations"))
    }
}
 
export const getDonationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (Utils.isNullOrEmpty(id) || !Utils.isBigInt(id)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID is invalid or was not provided correctly"));
            return;
        }

        const doesDonatationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id),
            }
        })) == 1 ? true : false;

        if (!doesDonatationExist) {
            res.status(400).json(HttpResult.Fail("Error donation does not exist"));
            return;
        }

        const gotDonation = await prisma.tb_donations.findUnique({
            where: {
                id: BigInt(id),
            }
        });

        const gotDonationsFormatted = {
            ...gotDonation,
            id: gotDonation?.id.toString(),
            id_donor: gotDonation?.id_donor.toString(),
        };

        res.status(200).json(HttpResult.success(gotDonationsFormatted));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error loading donation by ID"))
    }
}

/* PIX Controllers */

export const deletePixDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const doesPixDonationExist = (await prisma.tb_donation_pix.count({})) > 0 ? true : false;

        if (!doesPixDonationExist) {
            res.status(400).json(HttpResult.Fail("Error pix donation does not exist"));
            return;
        }

        await prisma.tb_donation_pix.deleteMany({});

        res.status(200).json(HttpResult.success("Pix donation deleted successfully"));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error deleting pix donation"));
    }
}

export const createPixDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newPixDonationData } = req.body as createPixDonationRequestBody;

        const doesPixDonationsExist = (await prisma.tb_donation_pix.count()) > 0 ? true : false;

        if (doesPixDonationsExist) {
            res.status(400).json(HttpResult.Fail("Error there is already a pix donation created"));
            return;
        }

        if (Utils.isNullOrEmpty(newPixDonationData.pix_key)) {
            res.status(400).json(HttpResult.Fail("Error the value of pix key is invalid"));
            return;
        } else if (newPixDonationData.pix_key.length > 32) {
            res.status(400).json(HttpResult.Fail("Error the value of pix key is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newPixDonationData.name)) {
            res.status(400).json(HttpResult.Fail("Error the value of name is invalid"));
            return;
        } else if (newPixDonationData.name.length > 32) {
            res.status(400).json(HttpResult.Fail("Error the value of name is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newPixDonationData.city)) {
            res.status(400).json(HttpResult.Fail("Error the value of city is invalid"));
            return;
        } else if (newPixDonationData.city.length > 32) {
            res.status(400).json(HttpResult.Fail("Error the value of city is too large"));
            return;
        }

        if (Utils.isNullOrEmpty(newPixDonationData.cep) || !Utils.isValidCep(newPixDonationData.cep)) {
            res.status(400).json(HttpResult.Fail("Error the value of cep is invalid"));
            return;
        } else if (newPixDonationData.cep.length > 32) {
            res.status(400).json(HttpResult.Fail("Error the value of cep is too large"));
            return;
        } else {
            newPixDonationData.cep = Utils.removeFormattingCep(newPixDonationData.cep);
        }

        const createdPixDonation = await prisma.tb_donation_pix.create({
            data: {
                pix_key: newPixDonationData.pix_key,
                name: newPixDonationData.name,
                city: newPixDonationData.city,
                cep: newPixDonationData.cep
            }
        })

        res.status(200).json(HttpResult.success(createdPixDonation));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error creating pix donation"));
    }
}

export const updatePixDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newPixDonationData } = req.body as updatePixDonationRequestBody;
        const auxPixDonation: any = {};

        const doesPixDonationExist = (await prisma.tb_donation_pix.findFirst({
            where: {
                pix_key: {
                    not: undefined
                }
            }
        }))

        if (!doesPixDonationExist) {
            res.status(400).json(HttpResult.Fail("Error pix donation does not exist"));
            return;
        }

        if (newPixDonationData.pix_key) {
            if (newPixDonationData.pix_key.length > 32) {
                res.status(400).json(HttpResult.Fail("Error the value of pix key is too large"));
                return;
            }

            const doesPixKeyIsUsing = (await prisma.tb_donation_pix.count({
                where: {
                    pix_key: newPixDonationData.pix_key,
                }
            })) > 0 ? true : false;

            if (doesPixKeyIsUsing) {
                res.status(400).json(HttpResult.Fail("Error a pix donation record already using this pix key"));
                return;
            }

            auxPixDonation.pix_key = newPixDonationData.pix_key;
        }

        if (newPixDonationData.name) {
            if (newPixDonationData.name.length > 25) {
                res.status(400).json(HttpResult.Fail("Error the value of name is too large"));
                return;
            }

            auxPixDonation.name = newPixDonationData.name
        }

        if (newPixDonationData.city) {
            if (newPixDonationData.city.length > 30) {
                res.status(400).json(HttpResult.Fail("Error the value of city is too large"));
                return;
            }

            auxPixDonation.city = newPixDonationData.city
        }

        if (newPixDonationData.cep) {
            if (newPixDonationData.cep.length > 8) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is too large"));
                return;
            } else if (!Utils.isValidCep(newPixDonationData.cep)) {
                res.status(400).json(HttpResult.Fail("Error the value of cep is invalid"));
                return;
            }

            auxPixDonation.cep = Utils.removeFormattingCep(newPixDonationData.cep);
        }

        const updatedPixDonation = await prisma.tb_donation_pix.update({
            where: {
                pix_key: doesPixDonationExist.pix_key
            },
            data: auxPixDonation,
        });

        res.status(200).json(HttpResult.success(updatedPixDonation));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error updating pix donation"));
    }
}

export const getPixDonationById = async (req: Request, res: Response): Promise<void> => {
    try {

        const doesPixDonationExist = (await prisma.tb_donation_pix.count({})) == 1 ? true : false;

        if (!doesPixDonationExist) {
            res.status(400).json(HttpResult.Fail("Error pix donation does not exist"));
            return;
        }

        const gotPixDonation = await prisma.tb_donation_pix.findFirst({});

        res.status(200).json(HttpResult.success(gotPixDonation))
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error loading pix donation by ID"));
    }
}

/* Items Donations Controller */

export const getItemsDonations = async (req: Request, res: Response): Promise<void> => {
    try {
        const gotItemsDonations = await prisma.tb_items_donations.findMany();

        const gotItemsDonationsFormatted = gotItemsDonations.map((itemDonation: any) => {
            itemDonation.id_donation = itemDonation.id_donation.toString();
            return itemDonation;
        });

        res.status(200).json(HttpResult.success(gotItemsDonationsFormatted));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error loading items donations"))
    }
}

export const bulkDeleteItemsDonations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ids } = req.body;
        const { Op } = require('sequelize');

        let count: number = 0

        for (let i = 0; i < ids.length; i++) {
            const itemDonation: any = ids[i];

            if (Utils.isNullOrEmpty(itemDonation.id_donation) || !Utils.isBigInt(itemDonation.id_donation)) {
                res.status(400).json(HttpResult.Fail("Error the value of donation ID from item donation is invalid or was not provided correctly"));
                return;
            }

            if (Utils.isNullOrEmpty(itemDonation.id_product) || !Utils.isBigInt(itemDonation.id_product)) {
                res.status(400).json(HttpResult.Fail("Error the value of product ID from item donation is invalid or was not provided correctly"));
                return;
            }

            const doesIdDonationExist = (await prisma.tb_donations.count({
                where: {
                    id: BigInt(itemDonation.id_donation),
                }
            })) == 1 ? true : false;

            if (!doesIdDonationExist) {
                res.status(400).json(HttpResult.Fail("Error there are  one or more IDs of donation that do not exist in array"));
                return;
            }

            const doesIdProductExist = (await prisma.tb_products.count({
                where: {
                    id: Number(itemDonation.id_product),
                }
            })) == 1 ? true : false;

            if (!doesIdProductExist) {
                res.status(400).json(HttpResult.Fail("Error there are one or more IDs of product that do not exist in array"));
                return;
            }

            const doesItemDonationExist = (await prisma.tb_items_donations.count({
                where: {
                    id_donation: BigInt(itemDonation.id_donation),
                    id_product: Number(itemDonation.id_product),
                }
            })) > 0 ? true : false;

            if (!doesItemDonationExist) {
                res.status(400).json(HttpResult.Fail("Error there are one or more items donation that do not exist in array"));
                return;
            }

            const deletedItemsDonations = await prisma.tb_items_donations.delete({
                where: {
                    id_donation_id_product: {
                        id_donation: BigInt(itemDonation.id_donation),
                        id_product: Number(itemDonation.id_product),
                    }
                }
            });

            deletedItemsDonations != undefined ? count += 1 : null;
        }

        res.status(200).json(HttpResult.success(count));
    } catch (error: any) {
        console.error(error)
        res.status(404).json(HttpResult.Fail("Error deleting items donations"));
    }
} 

export const deleteItemDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_donation, id_product } = req.params;

        if (Utils.isNullOrEmpty(id_donation) || !Utils.isBigInt(id_donation)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID from item donation is invalid or was not provided correctly"));
            return;
        }

        if (Utils.isNullOrEmpty(id_product) || !Utils.isNumber(id_product)) {
            res.status(400).json(HttpResult.Fail("Error the value of product ID from item donation is invalid or was not provided correctly"));
            return;
        }

        const doesDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id_donation),
            }
        })) == 1 ? true : false;
    
        if (!doesDonationExist) {
            res.status(400).json(HttpResult.Fail("Error donation ID does not exist at the table donation"));
            return;
        }

        const doesProducExist = (await prisma.tb_products.count({
            where: {
                id: Number(id_donation),
            }
        })) == 1 ? true : false;
    
        if (!doesProducExist) {
            res.status(400).json(HttpResult.Fail("Error product ID does not exist at the table product"));
            return;
        }

        const doesItemDonationExist = (await prisma.tb_items_donations.count({
            where: {
                id_donation: BigInt(id_donation),
                id_product: Number(id_product),
            }
        })) == 1 ? true : false;

        if (!doesItemDonationExist) {
            res.status(400).json(HttpResult.Fail("Error item donation does not exist"));
            return;
        }

        await prisma.tb_items_donations.delete({
            where: {
                id_donation_id_product: {
                    id_donation: BigInt(id_donation),
                    id_product: Number(id_product),
                }
            }
        });

        res.status(200).json(HttpResult.success("item donation deleted successfully"));
    } catch (error: any) {
        console.error(error)
        res.status(404).json(HttpResult.Fail("Error deleting item donation"));
    }
}

export const createItemDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newItemDonationData } = req.body as createItemsDonationsRequestBody;

        if (Utils.isNullOrEmpty(newItemDonationData.id_donation) || !Utils.isBigInt(newItemDonationData.id_donation)) {
            res.status(400).json(HttpResult.Fail("Error the value of ID donation is invalid"));
            return;
        }

        if (Utils.isNullOrEmpty(newItemDonationData.id_product) || !Utils.isBigInt(newItemDonationData.id_product)) {
            res.status(400).json(HttpResult.Fail("Error the value of ID product is invalid"));
            return;
        }

        if (Utils.isNullOrEmpty(newItemDonationData.amount)) {
            res.status(400).json(HttpResult.Fail("Error the value of amount is invalid"));
            return;
        } else if (newItemDonationData.amount != undefined && newItemDonationData.amount <= 0) {
            res.status(400).json(HttpResult.Fail("Error the value of amount is less than or equal to zero"));
            return;
        }

        const doesIdDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(newItemDonationData.id_donation),
            }
        })) == 1 ? true : false;

        if (!doesIdDonationExist) {
            res.status(400).json(HttpResult.Fail("Error the value of ID donation do not exist"));
            return;
        }

        const doesIdProductExist = (await prisma.tb_products.count({
            where: {
                id: Number(newItemDonationData.id_product),
            }
        })) == 1 ? true : false;

        if (!doesIdProductExist) {
            res.status(400).json(HttpResult.Fail("Error the value of ID product does not exist"));
            return;
        }

        const doesItemDonationExist = (await prisma.tb_items_donations.count({
            where: {
                id_donation: BigInt(newItemDonationData.id_donation),
                id_product: Number(newItemDonationData.id_product),
            }
        })) > 0 ? true : false;

        if (doesItemDonationExist) {
            res.status(400).json(HttpResult.Fail("Error there is already a item donation using those IDs"));
            return;
        }

        const createdItemDonation = await prisma.tb_items_donations.create({
            data: {
                id_donation: BigInt(newItemDonationData.id_donation),
                id_product: Number(newItemDonationData.id_product),
                amount: newItemDonationData.amount,
            }
        });

        const createdItemDonationFormatted = {
            ...createdItemDonation,
            id_donation: createdItemDonation.id_donation.toString(),
        }

        res.status(200).json(HttpResult.success(createdItemDonationFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error creating item donation"));
    }
}

export const updateItemDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_donation, id_product } = req.params;
        const { newItemDonationData } = req.body as updateItemsDonationsRequestBody;

        const auxItemDonation: any = {};

        if (Utils.isNullOrEmpty(id_donation) || !Utils.isBigInt(id_donation)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID from item donation is invalid or was not provided correctly"));
            return;
        }

        const doesDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id_donation),
            }
        })) == 1 ? true : false;

        if (!doesDonationExist) {
            res.status(400).json(HttpResult.Fail("Error donation does not exist"));
            return;
        }

        if (Utils.isNullOrEmpty(id_product) || !Utils.isBigInt(id_product)) {
            res.status(400).json(HttpResult.Fail("Error the value of product ID from item donation is invalid or was not provided correctly"));
            return;
        }

        const doesProductExist = (await prisma.tb_products.count({
            where: {
                id: Number(id_product),
            }
        })) == 1 ? true : false;

        if (!doesProductExist) {
            res.status(400).json(HttpResult.Fail("Error product does not exist"));
            return;
        }


        if (newItemDonationData.id_donation) {
            if (Utils.isNullOrEmpty(newItemDonationData.id_donation) || !Utils.isBigInt(newItemDonationData.id_donation)) {
                res.status(400).json(HttpResult.Fail("Error the new value of donation ID from item donation is invalid or was not provided correctly"));
                return;
            }

            const doesIdDonationExist = (await prisma.tb_donations.count({
                where: {
                    id: BigInt(newItemDonationData.id_donation),
                }
            })) == 1 ? true : false;

            if (!doesIdDonationExist) {
                res.status(400).json(HttpResult.Fail("Error new donation does not exist"));
                return;
            }

            auxItemDonation.id_donation = newItemDonationData.id_donation
        }

        if (newItemDonationData.id_product) {
            if (Utils.isNullOrEmpty(newItemDonationData.id_product) || !Utils.isBigInt(newItemDonationData.id_product)) {
                res.status(400).json(HttpResult.Fail("Error the new value of product ID from item donation is invalid or was not provided correctly"));
                return;
            }

            const doesProductExist = (await prisma.tb_products.count({
                where: {
                    id: Number(newItemDonationData.id_product),
                }
            })) == 1 ? true : false;

            if (!doesProductExist) {
                res.status(400).json(HttpResult.Fail("Error new product does not exist"));
                return;
            }

            auxItemDonation.id_product = newItemDonationData.id_product
        }

        if (newItemDonationData.amount != undefined) {
            if (newItemDonationData.amount <= 0) {
                res.status(400).json(HttpResult.Fail("Error new amount is less than or equal to zero"));
                return
            }

            auxItemDonation.amount = newItemDonationData.amount;
        }

        const doesItemDonationExist = (await prisma.tb_items_donations.count({
            where: {
                id_donation: Number(newItemDonationData.id_donation),
                id_product: Number(newItemDonationData.id_product),
            }
        })) > 0 ? true : false;

        if (!doesItemDonationExist) {
            res.status(400).json(HttpResult.Fail("Error item donation does not exist"));
            return;
        }

        const updatedItemDonation = await prisma.tb_items_donations.update({
            where: {
                id_donation_id_product: {
                    id_donation: BigInt(String(newItemDonationData.id_donation)),
                    id_product: Number(newItemDonationData.id_product),
                }
            },
            data: auxItemDonation,
        });

        const updatedItemDonationFormatted = {
            ...updatedItemDonation,
            id_donation: updatedItemDonation.id_donation.toString()
        }

        res.status(200).json(HttpResult.success(updatedItemDonationFormatted));
    } catch (error: any) {
        res.status(400).json(HttpResult.Fail("Error updating item donation"));
    }
}

export const getItemDonationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_donation, id_product } = req.params;

        if (Utils.isNullOrEmpty(id_donation) || !Utils.isBigInt(id_donation)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID from item donation is invalid or was not provided correctly"));
            return;
        }

        if (Utils.isNullOrEmpty(id_product) || !Utils.isNumber(id_product)) {
            res.status(400).json(HttpResult.Fail("Error the value of product ID from item donation is invalid or was not provided correctly"));
            return;
        }

        const doesDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id_donation),
            }
        })) == 1 ? true : false;
    
        if (!doesDonationExist) {
            res.status(400).json(HttpResult.Fail("Error donation ID does not exist at the table donation"));
            return;
        }

        const doesProducExist = (await prisma.tb_products.count({
            where: {
                id: Number(id_donation),
            }
        })) == 1 ? true : false;
    
        if (!doesProducExist) {
            res.status(400).json(HttpResult.Fail("Error product ID does not exist at the table product"));
            return;
        }

        const doesItemDonationExist = (await prisma.tb_items_donations.count({
            where: {
                id_donation: BigInt(id_donation),
                id_product: Number(id_product),
            }
        })) == 1 ? true : false;

        if (!doesItemDonationExist) {
            res.status(400).json(HttpResult.Fail("Error item donation does not exist"));
            return;
        }

        const gotItemDonation = await prisma.tb_items_donations.findUnique({
            where: {
                id_donation_id_product: {
                    id_donation: BigInt(id_donation),
                    id_product: Number(id_product),
                }
            }
        });

        const gotItemDonationFormatted = {
            ...gotItemDonation,
            id_donation: gotItemDonation?.id_donation.toString(),
            id_product: gotItemDonation?.id_product.toString()
        }

        res.status(200).json(HttpResult.success(gotItemDonationFormatted));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error loading item donation by ID"));
    }
}

export const getItemsDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_donation } = req.params;

        if (Utils.isNullOrEmpty(id_donation) || !Utils.isBigInt(id_donation)) {
            res.status(400).json(HttpResult.Fail("Error the value of donation ID from item donation is invalid or was not provided correctly"));
            return;
        }
    
        const doesDonationExist = (await prisma.tb_donations.count({
            where: {
                id: BigInt(id_donation),
            }
        })) == 1 ? true : false;
    
        if (!doesDonationExist) {
            res.status(400).json(HttpResult.Fail("Error donation ID does not exist at the table donation"));
            return;
        }
    
        const gotItemsDonation = await prisma.tb_items_donations.findMany({
            where: {
                id_donation: BigInt(id_donation),
            }
        });
    
        const gotItemsDonationFormatted = gotItemsDonation.map((itemDonation: any) => {
            itemDonation.id_donation = itemDonation.id_donation.toString();
            itemDonation.id_product = itemDonation.id_product.toString();
            return itemDonation;
        });

        res.status(200).json(HttpResult.success(gotItemsDonationFormatted));
    } catch (error: any) {
        res.status(404).json(HttpResult.Fail("Error loading item donation by donation ID"));
    }
}