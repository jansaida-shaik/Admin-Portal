const { prisma } = require('../prisma');

export const fireWebhook = async (event: string, payload: any) => {
  try {
    const allHooks = await prisma.webhook.findMany({ where: { isActive: true } });
    const webhooks = allHooks.filter((h: any) => h.events?.includes('ALL') || h.events?.includes(event));

    if (webhooks.length === 0) {
      console.log(`[WEBHOOK MOCK] Triggered webhook for event ${event}:`, payload);
      return { success: true, mocked: true };
    }

    for (const hook of webhooks) {
      try {
        await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error(`[WEBHOOK ERROR] Failed to send to ${hook.url}:`, err);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('[WEBHOOK ERROR] DB error:', error);
    return { success: false, error };
  }
};
