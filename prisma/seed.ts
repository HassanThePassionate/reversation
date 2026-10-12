import { PrismaClient, Role, ReservationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("Admin@123", BCRYPT_SALT_ROUNDS);
  const memberHash = await bcrypt.hash("Member@123", BCRYPT_SALT_ROUNDS);

  const teamData = ["Engineering", "Product", "Operations"];
  const teams = await Promise.all(
    teamData.map((name) =>
      prisma.team.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHash, role: Role.ADMIN },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
      teamId: teams[0]?.id,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { passwordHash: memberHash, role: Role.MEMBER },
    create: {
      name: "Regular Member",
      email: "member@example.com",
      passwordHash: memberHash,
      role: Role.MEMBER,
      teamId: teams[1]?.id,
    },
  });

  const typeData = [
    { name: "Meeting Room", description: "Shared meeting rooms" },
    { name: "Equipment", description: "AV and hardware equipment" },
    { name: "Vehicle", description: "Company transport pool" },
    { name: "Lab", description: "Specialized research spaces" },
  ];
  const types = await Promise.all(
    typeData.map((t) =>
      prisma.resourceType.upsert({
        where: { name: t.name },
        update: { description: t.description },
        create: t,
      })
    )
  );

  const resourcesData = [
    {
      name: "Boardroom Alpha",
      typeIdx: 0,
      location: "Floor 3",
      capacity: 16,
      openTime: "08:00",
      closeTime: "18:00",
      isActive: true,
    },
    {
      name: "Huddle Room B",
      typeIdx: 0,
      location: "Floor 2",
      capacity: 6,
      openTime: "09:00",
      closeTime: "20:00",
      isActive: true,
    },
    {
      name: "4K Laser Projector",
      typeIdx: 1,
      location: "Storage A",
      capacity: 1,
      openTime: "08:00",
      closeTime: "20:00",
      isActive: true,
    },
    {
      name: "VR Testing Rig",
      typeIdx: 1,
      location: "Lab 201",
      capacity: 2,
      openTime: "10:00",
      closeTime: "18:00",
      isActive: true,
    },
    {
      name: "Company Van",
      typeIdx: 2,
      location: "Garage P1",
      capacity: 10,
      openTime: "07:00",
      closeTime: "21:00",
      isActive: true,
    },
    {
      name: "Executive Sedan",
      typeIdx: 2,
      location: "Garage P2",
      capacity: 4,
      openTime: "08:00",
      closeTime: "19:00",
      isActive: true,
    },
    {
      name: "Electronics Lab",
      typeIdx: 3,
      location: "Building B",
      capacity: 8,
      openTime: "08:00",
      closeTime: "22:00",
      isActive: true,
    },
    {
      name: "Cleanroom Lab",
      typeIdx: 3,
      location: "Building C",
      capacity: 4,
      openTime: "09:00",
      closeTime: "17:00",
      isActive: false,
    },
  ];

  const resources = await Promise.all(
    resourcesData.map((r) => {
      const typeId = types[r.typeIdx]?.id ?? "";
      return prisma.resource.upsert({
        where: { id: `res-${r.name.toLowerCase().replace(/\s+/g, "-")}` },
        update: {
          name: r.name,
          typeId,
          location: r.location,
          capacity: r.capacity,
          openTime: r.openTime,
          closeTime: r.closeTime,
          isActive: r.isActive,
        },
        create: {
          id: `res-${r.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: r.name,
          typeId,
          location: r.location,
          capacity: r.capacity,
          openTime: r.openTime,
          closeTime: r.closeTime,
          isActive: r.isActive,
        },
      });
    })
  );

  const now = new Date();
  const day = (offset: number, hour: number, min = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  const reservationsData = [
    {
      id: "seed-res-1",
      rIdx: 0,
      u: admin.id,
      title: "Past Board Meeting",
      s: day(-2, 10),
      e: day(-2, 12),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-2",
      rIdx: 0,
      u: member.id,
      title: "Past Sprint Review",
      s: day(-1, 14),
      e: day(-1, 16),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-3",
      rIdx: 0,
      u: admin.id,
      title: "Today Morning Standup",
      s: day(0, 9),
      e: day(0, 10),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-4",
      rIdx: 0,
      u: member.id,
      title: "Today Client Demo",
      s: day(0, 11),
      e: day(0, 12),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-5",
      rIdx: 1,
      u: member.id,
      title: "Today Design Sync",
      s: day(0, 13),
      e: day(0, 14),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-6",
      rIdx: 1,
      u: admin.id,
      title: "Cancelled 1-on-1",
      s: day(0, 14),
      e: day(0, 15),
      st: ReservationStatus.CANCELLED,
    },
    {
      id: "seed-res-7",
      rIdx: 2,
      u: member.id,
      title: "Today All-Hands AV",
      s: day(0, 15),
      e: day(0, 17),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-8",
      rIdx: 4,
      u: admin.id,
      title: "Tomorrow Client Pickup",
      s: day(1, 8),
      e: day(1, 11),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-9",
      rIdx: 6,
      u: member.id,
      title: "Future Hardware Testing",
      s: day(2, 10),
      e: day(2, 13),
      st: ReservationStatus.CONFIRMED,
    },
    {
      id: "seed-res-10",
      rIdx: 5,
      u: admin.id,
      title: "Next Week Executive Trip",
      s: day(5, 9),
      e: day(5, 12),
      st: ReservationStatus.CONFIRMED,
    },
  ];

  await Promise.all(
    reservationsData.map((res) => {
      const resourceId = resources[res.rIdx]?.id ?? "";
      return prisma.reservation.upsert({
        where: { id: res.id },
        update: {
          title: res.title,
          resourceId,
          userId: res.u,
          startTime: res.s,
          endTime: res.e,
          status: res.st,
        },
        create: {
          id: res.id,
          title: res.title,
          resourceId,
          userId: res.u,
          startTime: res.s,
          endTime: res.e,
          status: res.st,
        },
      });
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
