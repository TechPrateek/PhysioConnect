import { PrismaClient, UserRole, VerificationStatus, DayOfWeek, AppointmentType } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PhysioConnect (Etawah) Database Seed...");

  // 1. Seed Specializations
  const specializationsData = [
    {
      name: "Orthopedic & Musculoskeletal",
      slug: "orthopedic",
      description: "Back pain, slip disc, cervical spondylosis, arthritis, and joint stiffness.",
      icon: "Activity",
    },
    {
      name: "Neuro Rehabilitation",
      slug: "neuro-rehab",
      description: "Paralysis, stroke recovery, Parkinson's disease, and spinal cord injuries.",
      icon: "Brain",
    },
    {
      name: "Sports Injury & Conditioning",
      slug: "sports-injury",
      description: "Ligament tears (ACL/PCL), ankle sprains, muscle tears, and agility recovery.",
      icon: "Zap",
    },
    {
      name: "Post-Surgical Rehabilitation",
      slug: "post-surgical",
      description: "Total knee/hip replacement rehab, rotator cuff repair, and post-fracture mobility.",
      icon: "Hospital",
    },
    {
      name: "Geriatric & Elderly Care",
      slug: "geriatric",
      description: "Fall prevention, balance training, age-related chronic pain, and mobility maintenance.",
      icon: "Home",
    },
    {
      name: "Pediatric Physiotherapy",
      slug: "pediatric",
      description: "Delayed milestones, cerebral palsy, clubfoot, and pediatric motor coordination.",
      icon: "Smile",
    },
  ];

  const seededSpecs: Record<string, string> = {};

  for (const spec of specializationsData) {
    const record = await prisma.specialization.upsert({
      where: { slug: spec.slug },
      update: spec,
      create: spec,
    });
    seededSpecs[spec.slug] = record.id;
  }
  console.log(`✅ Seeded ${specializationsData.length} specializations`);

  // 2. Seed Admin User
  const adminPasswordHash = await argon2.hash("Admin@Etawah2026");
  const adminEmail = "admin@physioconnect.in";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Etawah Admin Ops",
      role: UserRole.ADMIN,
      password: adminPasswordHash,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      name: "Etawah Admin Ops",
      role: UserRole.ADMIN,
      password: adminPasswordHash,
      emailVerified: true,
      admin: {
        create: {
          fullName: "Etawah Platform Operations Lead",
          department: "Central Operations - Etawah",
          isSuperAdmin: true,
        },
      },
    },
    include: { admin: true },
  });

  if (!adminUser.admin) {
    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        fullName: "Etawah Platform Operations Lead",
        department: "Central Operations - Etawah",
        isSuperAdmin: true,
      },
    });
  }
  console.log("✅ Seeded Admin account:", adminEmail);

  // 3. Seed Verified Physiotherapists
  const physioPasswordHash = await argon2.hash("Physio@Etawah2026");

  const physiosData = [
    {
      email: "dr.amit.sharma@physioconnect.in",
      name: "Dr. Amit Sharma",
      phone: "+91 94123 45678",
      experienceYears: 8,
      consultationFee: 600,
      clinicAddress: "Shop 4, Civil Lines Road, Near Shastri Chauraha, Etawah",
      bio: "MPT in Orthopedics with 8+ years clinical and home rehabilitation experience. Expert in slip disc, sciatica, and knee replacement recovery across Etawah.",
      languages: ["Hindi", "English"],
      homeVisitAvailable: true,
      clinicVisitAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
      averageRating: 4.9,
      totalReviews: 24,
      specs: ["orthopedic", "post-surgical"],
    },
    {
      email: "dr.priya.verma@physioconnect.in",
      name: "Dr. Priya Verma",
      phone: "+91 98371 23456",
      experienceYears: 5,
      consultationFee: 500,
      clinicAddress: "Plot 12, Friends Colony Main Market, Etawah",
      bio: "BPT certified neuro and geriatric physiotherapist. Dedicated to stroke rehabilitation, balance maintenance, and home visits in Friends Colony & Ashok Nagar.",
      languages: ["Hindi", "English"],
      homeVisitAvailable: true,
      clinicVisitAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
      averageRating: 4.8,
      totalReviews: 18,
      specs: ["neuro-rehab", "geriatric"],
    },
    {
      email: "dr.rajesh.singh@physioconnect.in",
      name: "Dr. Rajesh Singh",
      phone: "+91 99270 87654",
      experienceYears: 6,
      consultationFee: 550,
      clinicAddress: "Near Railway Station Road, Vijay Nagar, Etawah",
      bio: "Sports physiotherapist specializing in sports injuries, ACL rehabilitation, muscle tears, and postural correction.",
      languages: ["Hindi", "English"],
      homeVisitAvailable: true,
      clinicVisitAvailable: false,
      verificationStatus: VerificationStatus.APPROVED,
      averageRating: 5.0,
      totalReviews: 12,
      specs: ["sports-injury", "orthopedic"],
    },
  ];

  const days: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  for (const physio of physiosData) {
    const user = await prisma.user.upsert({
      where: { email: physio.email },
      update: {
        name: physio.name,
        role: UserRole.PHYSIOTHERAPIST,
        password: physioPasswordHash,
        emailVerified: true,
      },
      create: {
        email: physio.email,
        name: physio.name,
        role: UserRole.PHYSIOTHERAPIST,
        password: physioPasswordHash,
        emailVerified: true,
        physiotherapist: {
          create: {
            fullName: physio.name,
            phone: physio.phone,
            email: physio.email,
            experienceYears: physio.experienceYears,
            consultationFee: physio.consultationFee,
            clinicAddress: physio.clinicAddress,
            bio: physio.bio,
            languages: physio.languages,
            homeVisitAvailable: physio.homeVisitAvailable,
            clinicVisitAvailable: physio.clinicVisitAvailable,
            verificationStatus: physio.verificationStatus,
            averageRating: physio.averageRating,
            totalReviews: physio.totalReviews,
            city: "Etawah",
            state: "Uttar Pradesh",
          },
        },
      },
      include: { physiotherapist: true },
    });

    if (user.physiotherapist) {
      const pId = user.physiotherapist.id;

      // Link specializations
      for (const specSlug of physio.specs) {
        const specId = seededSpecs[specSlug];
        if (specId) {
          await prisma.physiotherapistSpecialization.upsert({
            where: {
              physiotherapistId_specializationId: {
                physiotherapistId: pId,
                specializationId: specId,
              },
            },
            update: {},
            create: {
              physiotherapistId: pId,
              specializationId: specId,
            },
          });
        }
      }

      // Seed weekly availability slots
      for (const day of days) {
        const existingAvail = await prisma.availability.findFirst({
          where: {
            physiotherapistId: pId,
            dayOfWeek: day,
          },
        });

        if (existingAvail) {
          await prisma.availability.update({
            where: { id: existingAvail.id },
            data: {
              startTime: "09:00",
              endTime: "19:00",
              slotDurationMinutes: 60,
              isActive: true,
              isHomeVisit: physio.homeVisitAvailable,
              isClinicVisit: physio.clinicVisitAvailable,
            },
          });
        } else {
          await prisma.availability.create({
            data: {
              physiotherapistId: pId,
              dayOfWeek: day,
              startTime: "09:00",
              endTime: "19:00",
              slotDurationMinutes: 60,
              isActive: true,
              isHomeVisit: physio.homeVisitAvailable,
              isClinicVisit: physio.clinicVisitAvailable,
            },
          });
        }
      }
    }
  }
  console.log(`✅ Seeded ${physiosData.length} verified physiotherapists with schedules`);

  // 4. Seed Sample Patient with Address in Etawah
  const patientPasswordHash = await argon2.hash("Patient@Etawah2026");
  const patientEmail = "patient.rohit@physioconnect.in";

  const patientUser = await prisma.user.upsert({
    where: { email: patientEmail },
    update: {
      name: "Rohit Tripathi",
      role: UserRole.PATIENT,
      password: patientPasswordHash,
      emailVerified: true,
    },
    create: {
      email: patientEmail,
      name: "Rohit Tripathi",
      role: UserRole.PATIENT,
      password: patientPasswordHash,
      emailVerified: true,
      patient: {
        create: {
          fullName: "Rohit Tripathi",
          phone: "+91 91234 56789",
          email: patientEmail,
          gender: "Male",
          emergencyContact: "+91 98765 43210",
          medicalHistory: "Mild lower back stiffness after sitting for long hours.",
          addresses: {
            create: {
              label: "Home",
              street: "House No. 104, Lane 3, Near Water Tank",
              area: "Friends Colony",
              city: "Etawah",
              state: "Uttar Pradesh",
              pincode: "206001",
              landmark: "Opposite Gyan Mandir School",
              isDefault: true,
            },
          },
        },
      },
    },
    include: { patient: { include: { addresses: true } } },
  });

  console.log("✅ Seeded sample patient account:", patientEmail);
  console.log("✨ PhysioConnect database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
