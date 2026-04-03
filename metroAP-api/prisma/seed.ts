import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MetroAP database...\n')

  // ── Operator ───────────────────────────────────────────────────────────────
  const operator = await db.operator.upsert({
    where:  { slug: 'super-metro' },
    update: {},
    create: { name: 'Super Metro', slug: 'super-metro' },
  })
  console.log(`✓ Operator: ${operator.name}`)

  // ── Corridors + stops ──────────────────────────────────────────────────────

  const corridorData = [
    {
      name:  'Thika Road',
      color: '#00C896',
      variants: [
        {
          code:      'TH-01-OUT',
          label:     'Outbound',
          direction: 'OUT' as const,
          stops: [
            { name: 'Archives',         slug: 'archives',         lat: -1.2833, lng: 36.8167 },
            { name: 'Globe Roundabout', slug: 'globe-roundabout', lat: -1.2796, lng: 36.8251 },
            { name: 'Pangani',          slug: 'pangani',          lat: -1.2689, lng: 36.8312 },
            { name: 'Muthaiga',         slug: 'muthaiga',         lat: -1.2534, lng: 36.8401 },
            { name: 'Roysambu',         slug: 'roysambu',         lat: -1.2201, lng: 36.8710 },
            { name: 'Kahawa West',      slug: 'kahawa-west',      lat: -1.1876, lng: 36.9012 },
            { name: 'Thika Town',       slug: 'thika-town',       lat: -1.0332, lng: 37.0693 },
          ],
        },
        {
          code:      'TH-01-IN',
          label:     'Inbound',
          direction: 'IN' as const,
          stops: [
            { name: 'Thika Town',       slug: 'thika-town',       lat: -1.0332, lng: 37.0693 },
            { name: 'Kahawa West',      slug: 'kahawa-west',      lat: -1.1876, lng: 36.9012 },
            { name: 'Roysambu',         slug: 'roysambu',         lat: -1.2201, lng: 36.8710 },
            { name: 'Muthaiga',         slug: 'muthaiga',         lat: -1.2534, lng: 36.8401 },
            { name: 'Pangani',          slug: 'pangani',          lat: -1.2689, lng: 36.8312 },
            { name: 'Globe Roundabout', slug: 'globe-roundabout', lat: -1.2796, lng: 36.8251 },
            { name: 'Archives',         slug: 'archives',         lat: -1.2833, lng: 36.8167 },
          ],
        },
        {
          code:      'TH-01-EXP',
          label:     'Express',
          direction: 'OUT' as const,
          stops: [
            { name: 'Archives',   slug: 'archives',   lat: -1.2833, lng: 36.8167 },
            { name: 'Roysambu',   slug: 'roysambu',   lat: -1.2201, lng: 36.8710 },
            { name: 'Thika Town', slug: 'thika-town', lat: -1.0332, lng: 37.0693 },
          ],
        },
      ],
    },
    {
      name:  'Westlands',
      color: '#4D9FFF',
      variants: [
        {
          code:      'WL-02-OUT',
          label:     'Outbound',
          direction: 'OUT' as const,
          stops: [
            { name: 'Archives',       slug: 'archives',         lat: -1.2833, lng: 36.8167 },
            { name: 'University Way', slug: 'university-way',   lat: -1.2792, lng: 36.8128 },
            { name: 'Museum Hill',    slug: 'museum-hill',      lat: -1.2735, lng: 36.8082 },
            { name: 'Westlands',      slug: 'westlands',        lat: -1.2636, lng: 36.8065 },
            { name: 'Sarit Centre',   slug: 'sarit-centre',     lat: -1.2601, lng: 36.8030 },
          ],
        },
        {
          code:      'WL-02-IN',
          label:     'Inbound',
          direction: 'IN' as const,
          stops: [
            { name: 'Sarit Centre',   slug: 'sarit-centre',     lat: -1.2601, lng: 36.8030 },
            { name: 'Westlands',      slug: 'westlands',        lat: -1.2636, lng: 36.8065 },
            { name: 'Museum Hill',    slug: 'museum-hill',      lat: -1.2735, lng: 36.8082 },
            { name: 'University Way', slug: 'university-way',   lat: -1.2792, lng: 36.8128 },
            { name: 'Archives',       slug: 'archives',         lat: -1.2833, lng: 36.8167 },
          ],
        },
      ],
    },
  ]

  for (const cData of corridorData) {
    const corridor = await db.corridor.upsert({
      where:  { name: cData.name },  // assumes name is unique per operator
      update: {},
      create: { name: cData.name, color: cData.color, operatorId: operator.id },
    })

    for (const vData of cData.variants) {
      // Upsert each stop
      const stopRecords = []
      for (const s of vData.stops) {
        const stop = await db.stop.upsert({
          where:  { slug: s.slug },
          update: { lat: s.lat, lng: s.lng },
          create: { name: s.name, slug: s.slug, lat: s.lat, lng: s.lng },
        })
        stopRecords.push(stop)
      }

      // Upsert variant
      const variant = await db.routeVariant.upsert({
        where:  { code: vData.code },
        update: {},
        create: {
          code:       vData.code,
          label:      vData.label,
          direction:  vData.direction,
          corridorId: corridor.id,
        },
      })

      // Create stop associations (delete + recreate to handle reseeding)
      await db.routeVariant_Stop.deleteMany({ where: { variantId: variant.id } })
      await db.routeVariant_Stop.createMany({
        data: stopRecords.map((stop, order) => ({
          variantId: variant.id,
          stopId:    stop.id,
          stopOrder: order,
        })),
      })

      console.log(`  ✓ ${vData.code} (${stopRecords.length} stops)`)
    }
    console.log(`✓ Corridor: ${corridor.name}`)
  }

  // ── Buses ──────────────────────────────────────────────────────────────────
  const fleetNumbers = ['SM-001', 'SM-002', 'SM-003', 'SM-004', 'SM-047', 'SM-112']
  for (const fn of fleetNumbers) {
    await db.bus.upsert({
      where:  { fleetNumber: fn },
      update: {},
      create: { fleetNumber: fn, capacity: 50, operatorId: operator.id },
    })
  }
  console.log(`✓ Buses: ${fleetNumbers.length} created`)

  // ── Test conductor ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10)
  const conductor = await db.conductor.upsert({
    where:  { phone: '0712345678' },
    update: {},
    create: {
      name:         'John Conductor',
      phone:        '0712345678',
      passwordHash,
      operatorId:   operator.id,
    },
  })
  console.log(`✓ Test conductor: ${conductor.name} (phone: ${conductor.phone}, password: password123)`)

  console.log('\n✅ Seed complete.\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
