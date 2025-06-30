import { Schema } from 'mongoose';
import { STATUS } from '../constant/GlobalConstant.js';

const DemoSchema = new Schema(
    {
        status : {
            type : String,
            enum : [STATUS?.ACTIVE, STATUS?.SUSPENDED],
            default : STATUS?.ACTIVE
        },
        createdBy: Schema.Types.ObjectId,
        moduleAccess  : Array
    },
    {
        timestamps : true,
        strict : false
    }
)

const DemoMDL = db => db.model('role',DemoSchema);
export default DemoMDL;