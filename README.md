Backend folder def

Frontend folder def

    Might be able to inject data via Operator injection:
    Operator Injection. This happens when an attacker sends an Object instead of a String.

    The Attack: An attacker sends { "not": "" } as a password in a JSON request.

    The Risk: In some cases, the ORM might translate that into "find a user where the password is NOT empty," letting them log in without a password.

    The Fix: Type Casting. Always ensure your inputs are strings before they hit Prisma.

    Prob fix:
    const cleanId = String(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: cleanId } });
