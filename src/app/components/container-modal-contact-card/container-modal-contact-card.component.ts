import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ContainerModalCardService } from '../../core/services/container-modal-card.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/shared/dialog.service';
import { InfoInmuebleService } from '../../core/services/info-inmueble.service';

@Component({
  selector: 'app-container-modal-contact-card',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './container-modal-contact-card.component.html',
  styleUrl: './container-modal-contact-card.component.less'
})
export class ContainerModalContactCardComponent implements OnInit {

  public containerModalCardService = inject(ContainerModalCardService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogService = inject(DialogService);
  private readonly infoInmuebleService = inject(InfoInmuebleService);

  contactForm!: FormGroup;
  isSubmitted = signal(false);
  isLoading = signal(false);

  constructor() {
    // Usamos un effect para actualizar el mensaje si la propiedad cambia
    effect(() => {
      const property = this.containerModalCardService.selectedProperty();
      if (property && this.contactForm) {
        this.contactForm.patchValue({
          mensaje: `Hola, estoy interesado en la propiedad ubicada en ${property.address}. Por favor, contáctenme.`
        });
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje: ['', [Validators.required]]
    });
  }

  sendForm(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      const property = this.containerModalCardService.selectedProperty();

      if (!property) return;

      this.isLoading.set(true); // Opcional: mostrar un loader en el botón

      // 1. Enviamos los datos al servicio
      this.infoInmuebleService.solicitarInmueble(property.id, formData).subscribe({
        next: (updatedProperty) => {
          this.isLoading.set(false);
          this.isSubmitted.set(true); // Muestra tu HTML del check verde

          // 2. Avisamos a la app que este inmueble cambió
          this.infoInmuebleService.propertyUpdated$.next(updatedProperty);

          // 3. Cerramos el modal automáticamente después de 3 segundos
          setTimeout(() => {
            this.containerModalCardService.closeContactForm();
            this.isSubmitted.set(false); // Reseteamos para la próxima vez
            this.contactForm.reset();
          }, 3000);
        },
        error: (err) => {
          console.error('Error enviando la solicitud', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}
