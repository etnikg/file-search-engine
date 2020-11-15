import express, {Response, Request} from "express";
import * as bodyParser from "body-parser";
import {Service} from "./service";

const router= express.Router();

router.use(bodyParser.json({
    limit: '50mb',
    verify(req: any, res, buf, encoding) {
        req.rawBody = buf;
    }
}));

router.get(
    '/',
    async(
        req: Request,
        res: Response
    ): Promise<Response | void>=>{
        try {
            await Service.indexBook();
            const frequency=await Service.findOcurrence(`${process.env.FIRST_INDEX}`,'oliver-twist.txt','body');
            return res.json({ frequency}).end();
        } catch (e) {
            console.log(e)
        }
    }
);

router.get(
    '/name-count/:name',
    async(
        req: Request,
        res: Response
    ): Promise<Response | void>=>{
        try {
            const resp=await Service.nameFrequency(`${process.env.SECOND_INDEX}`,req.params.name);
            return res.json(resp).end();
        } catch (e) {
            console.log(e)
        }
    }
);

export default router;
