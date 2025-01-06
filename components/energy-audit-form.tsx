'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const formSchema = z.object({
  department: z.string().min(1, 'Departamento es requerido'),
  city: z.string().min(1, 'Ciudad es requerida'),
  subsector: z.string().min(1, 'Subsector es requerido'),
  entityName: z.string().min(1, 'Nombre de la entidad es requerido'),
  address: z.string().min(1, 'Dirección es requerida'),
  startTime: z.string().min(1, 'Hora de inicio es requerida'),
  endTime: z.string().min(1, 'Hora de fin es requerida'),
  occupationDays: z.string().min(1, 'Días de ocupación son requeridos'),
  workers: z.string().min(1, 'Número de trabajadores es requerido'),
  patients: z.string(),
  visitors: z.string(),
  students: z.string(),
  activities: z.string(),
  constructionYear: z.string(),
  totalArea: z.string(),
  usableArea: z.string(),
  buildingTenure: z.string(),
  isResponsible: z.enum(['yes', 'no']),
  responsibleEntity: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function EnergyAuditForm() {
  const router = useRouter()
  const [departments, setDepartments] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [subsectors, setSubsectors] = useState<string[]>([])
  const [entities, setEntities] = useState<string[]>([])
  
  const tenenciaOptions = [
    { value: 'Seleccione', label: 'seleccione' },
    { value: 'Propia', label: 'Propia' },
    { value: 'Arrendamiento', label: 'Arrendamiento' },
    { value: 'comodato', label: 'Comodato' },
    { value: 'Usufructo', label: 'Usufructo' },
    { value: 'Otro', label: 'Otro' },
   
  ];
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isResponsible: 'no',
    },
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (form.watch('department')) {
      fetchCities(form.watch('department'))
    }
  }, [form.watch('department')])

  useEffect(() => {
    if (form.watch('city')) {
      fetchSubsectors(form.watch('department'), form.watch('city'))
    }
  }, [form.watch('city')])

  useEffect(() => {
    if (form.watch('subsector')) {
      fetchEntities(form.watch('department'), form.watch('city'), form.watch('subsector'))
    }
  }, [form.watch('subsector')])

  async function fetchDepartments() {
    const { data, error } = await supabase
      .from('direcciones')
      .select('departamento'); // No usamos .order aquí
  
    if (error) {
      console.error('Error fetching departments:', error);
    } else {
      // Elimina duplicados y ordena alfabéticamente
      const uniqueDepartments = Array.from(new Set(data.map(item => item.departamento))).sort();
      setDepartments(uniqueDepartments);
    }
  }
  
// Obtener ciudades
async function fetchCities(department: string) {
  const { data, error } = await supabase
    .from('direcciones')
    .select('ciudad') // No usamos .order aquí
    .eq('departamento', department); // Filtramos por departamento

  if (error) {
    console.error('Error fetching cities:', error);
  } else {
    // Elimina duplicados y ordena alfabéticamente
    const uniqueCities = Array.from(new Set(data.map(item => item.ciudad))).sort();
    setCities(uniqueCities);
  }
}

// Obtener subsector
async function fetchSubsectors(department: string, city: string) {
  const { data, error } = await supabase
    .from('direcciones')
    .select('subsector') // No usamos .order aquí
    .eq('departamento', department)
    .eq('ciudad', city); // Filtramos por departamento y ciudad

  if (error) {
    console.error('Error fetching subsectors:', error);
  } else {
    // Elimina duplicados y ordena alfabéticamente
    const uniqueSubsectors = Array.from(new Set(data.map(item => item.subsector))).sort();
    setSubsectors(uniqueSubsectors);
  }
}

// Obtener entidades
async function fetchEntities(department: string, city: string, subsector: string) {
  const { data, error } = await supabase
    .from('direcciones')
    .select('nombreEntidad') // No usamos .order aquí
    .eq('departamento', department)
    .eq('ciudad', city)
    .eq('subsector', subsector); // Filtramos por departamento, ciudad y subsector

  if (error) {
    console.error('Error fetching entities:', error);
  } else {
    // Elimina duplicados y ordena alfabéticamente
    const uniqueEntities = Array.from(new Set(data.map(item => item.nombreEntidad))).sort();
    setEntities(uniqueEntities);
  }
}


async function onSubmit(values: FormData) {
  try {
    const { error } = await supabase.from('firstSection').insert([
      {
        department: values.department,
        city: values.city,
        subsector: values.subsector,
        entityName: values.entityName,
        address: values.address,
        startTime: values.startTime,
        endTime: values.endTime,
        occupationDays: values.occupationDays,
        workers: values.workers,
        patients: values.patients,
        visitors: values.visitors,
        students: values.students,
        activities: values.activities,
        constructionYear: values.constructionYear,
        totalArea: values.totalArea,
        usableArea: values.usableArea,
        buildingTenure: values.buildingTenure,
        isResponsible: values.isResponsible,
        responsibleEntity: values.responsibleEntity,
      },
    ]);

    if (error) {
      console.error('Error inserting data:', error);
      alert('Hubo un error al guardar los datos. Por favor, inténtelo de nuevo.');
    } else {
      console.log('Data inserted successfully');
      alert('Datos guardados exitosamente');
      // Redirect to next section after successful submission
      router.push('/section-b');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Ocurrió un error inesperado.');
  }
}


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Reporte de las medidas implementadas, derivadas de las auditorias energéticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Sección A. Caracterización de la edificación</h2>
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la ciudad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subsector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsector</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el subsector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subsectors.map((subsector) => (
                          <SelectItem key={subsector} value={subsector}>
                            {subsector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la entidad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la entidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity} value={entity}>
                            {entity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Características de la operación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio de la ocupación/operación</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de fin de la ocupación/operación</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="occupationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de ocupación/operación</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="workers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trabajadores</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pacientes</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visitors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitantes</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estudiantes</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de las actividades</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describa las actividades desarrolladas dentro de la edificación..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Características de la edificación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField
    control={form.control}
    name="constructionYear"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Año de construcción</FormLabel>
        <FormControl>
          <Input type="number" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="totalArea"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Área total (m²)</FormLabel>
        <FormControl>
          <Input type="number" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="usableArea"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Área útil ocupada (m²)</FormLabel>
        <FormControl>
          <Input type="number" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Campo de Tipo de Tenencia reemplazado por un desplegable */}
  <FormField
    control={form.control}
    name="buildingTenure"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Tipo de tenencia</FormLabel>
        <FormControl>
          <select
            {...field}
            className="border rounded p-2 w-full"
          >
            {tenenciaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

              <FormField
                control={form.control}
                name="isResponsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿La entidad es responsable del pago de servicios públicos?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Sí
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            No
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('isResponsible') === 'no' && (
                <FormField
                  control={form.control}
                  name="responsibleEntity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especifique el nombre de la entidad a cargo del pago</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button type="submit" className="w-full">
              Siguiente sección
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

