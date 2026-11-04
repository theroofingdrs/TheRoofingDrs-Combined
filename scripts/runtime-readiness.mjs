import {assessRuntime} from '../booking/runtime-readiness.ts';
const result=assessRuntime(process.env);console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=2;
