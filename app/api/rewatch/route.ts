import { loadRewatch } from '../../../lib/rewatch.mjs';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET(){
 try {return Response.json(await loadRewatch(),{headers:{'Cache-Control':'private, no-store'}});}
 catch(error){return Response.json({error:error instanceof Error?error.message:'Could not refresh the sources.'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
