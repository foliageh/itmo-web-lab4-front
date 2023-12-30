import {AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core'
import {HeaderComponent} from '../../layout/header/header.component'
import {TableModule} from 'primeng/table'
import {Shot} from '../../domain/shot'
import {InputGroupModule} from 'primeng/inputgroup'
import {InputGroupAddonModule} from 'primeng/inputgroupaddon'
import {InputTextModule} from 'primeng/inputtext'
import {RouterLink} from '@angular/router'
import {ButtonModule} from 'primeng/button'
import {FormsModule, NgForm} from '@angular/forms'
import {MessageService} from 'primeng/api'
import {ShotService} from '../../services/shot.service'
import {CheckboxChangeEvent, CheckboxModule} from 'primeng/checkbox'

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    TableModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    RouterLink,
    ButtonModule,
    FormsModule,
    CheckboxModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements AfterViewInit, OnInit {
  private messageService = inject(MessageService)

  // shots:
  private shotService = inject(ShotService)
  public shots: Shot[] = []

  // form:
  public selectedX: number[] = []
  public readonly availableX = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
  public selectedR: number[] = []
  public readonly availableR = [1, 2, 3, 4]

  // plot:
  @ViewChild('plot') canvasRef!: ElementRef<HTMLCanvasElement>
  private ctx!: CanvasRenderingContext2D
  private canvas!: HTMLCanvasElement
  private readonly R = 150
  private scale!: number

  ngOnInit(): void {
    this.shotService.retrieveShots().subscribe((shots) => this.shots = shots)
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement
    this.ctx = this.canvas.getContext('2d')!
    this.scale = this.canvas.width / (1.25 * 2 * this.R)
    this.drawPlot()
  }

  shoot(x: number | string, y: number | string, r: number | string) {
    this.shotService.createShot(x, y, r).subscribe((shot) => {
      this.shots = this.shots.concat(shot) // reassign array for proper p-table functioning
      this.drawPlot()
    })
  }

  onSubmit(form: NgForm) {
    const {x: xList, y, r: rList} = form.value
    xList.forEach((x: any) => rList.forEach((r: any) => this.shoot(x, y, r)))
  }

  isFormValid(form: NgForm) {
    const {x: xList, y, r: rList} = form.value
    return xList?.length && rList?.length && y >= -3 && y <= 3 && /^(?:-3|\+?3)(?:[.,]0{1,15})?$|^(?:-[210]|\+?[012])(?:[.,]\d{1,15})?$/.test(y)
  }

  getLastSelectedR() {
    return this.selectedR.length ? this.selectedR[this.selectedR.length - 1] : null
  }

  handleXChanged(event: CheckboxChangeEvent) {
    this.drawPlot()
  }

  handleRChanged(event: CheckboxChangeEvent) {
    this.drawPlot()
  }

  onCanvasClick(event: MouseEvent) {
    const r = this.getLastSelectedR()
    if (!r) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: "R is not set!"})
      return
    }
    const x = (r * (event.offsetX - this.canvas.width / 2) / this.R / this.scale).toFixed(4)
    const y = (-r * (event.offsetY - this.canvas.width / 2) / this.R / this.scale).toFixed(4)
    this.shoot(x, y, r)
  }

  drawPlot() {
    const transformX = (x: number) => this.canvas.width / 2 + x * this.scale
    const transformY = (y: number) => this.canvas.height / 2 - y * this.scale

    const fontSize = 15
    this.ctx.font = `${fontSize}px monospace`
    this.ctx.fillStyle = '#3b82f6'
    this.ctx.strokeStyle = 'black'
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // rectangle
    this.ctx.fillRect(transformX(-this.R), transformY(0), this.R * this.scale, (this.R / 2) * this.scale)

    // triangle
    this.ctx.beginPath()
    this.ctx.moveTo(transformX(-this.R / 2), transformY(0))
    this.ctx.lineTo(transformX(0), transformY(0))
    this.ctx.lineTo(transformX(0), transformY(this.R))
    this.ctx.closePath()
    this.ctx.fill()

    // semicircle
    this.ctx.beginPath()
    this.ctx.arc(transformX(0), transformY(0), (this.R / 2) * this.scale, -Math.PI / 2, 0, false)
    this.ctx.arc(transformX(0), transformY(0), (this.R / 2) * this.scale, -Math.PI / 2, 0, false)
    this.ctx.lineTo(transformX(0), transformY(0))
    this.ctx.closePath()
    this.ctx.fill()

    // coordinate plane
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.canvas.height / 2)
    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2)
    this.ctx.moveTo(this.canvas.width - 10, this.canvas.height / 2 - 5)
    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2)
    this.ctx.lineTo(this.canvas.width - 10, this.canvas.height / 2 + 5)
    this.ctx.moveTo(this.canvas.width / 2, this.canvas.height)
    this.ctx.lineTo(this.canvas.width / 2, 0)
    this.ctx.lineTo(this.canvas.width / 2 - 5, 10)
    this.ctx.moveTo(this.canvas.width / 2, 0)
    this.ctx.lineTo(this.canvas.width / 2 + 5, 10)
    this.ctx.stroke()

    // ticks
    this.ctx.beginPath()
    for (const [x, y] of [[this.R / 2, 0], [this.R, 0], [0, this.R / 2], [0, this.R], [-this.R / 2, 0], [-this.R, 0], [0, -this.R / 2], [0, -this.R]]) {
      this.ctx.moveTo(transformX(x) - 5 * Number(x === 0), transformY(y) - 5 * Number(y === 0))
      this.ctx.lineTo(transformX(x) + 5 * Number(x === 0), transformY(y) + 5 * Number(y === 0))
    }
    this.ctx.stroke()

    // labels
    const shotR = this.getLastSelectedR()
    let labels = ['-R', '-R/2', 'R/2', 'R']
    if (shotR != null) labels = [-shotR, -shotR / 2, shotR / 2, shotR].map(r => r.toString())
    this.ctx.fillStyle = 'black'
    this.ctx.fillText(labels[0], transformX(-this.R) - fontSize / 3.6 * labels[0].length, transformY(0) - 8)
    this.ctx.fillText(labels[1], transformX(-this.R / 2) - fontSize / 3.6 * labels[1].length, transformY(0) - 8)
    this.ctx.fillText(labels[2], transformX(this.R / 2) - fontSize / 3.6 * labels[2].length, transformY(0) - 8)
    this.ctx.fillText(labels[3], transformX(this.R) - fontSize / 3.6 * labels[3].length, transformY(0) - 8)
    this.ctx.fillText('x', transformX(this.R + 32) - fontSize / 3.6, transformY(0) - 8)
    this.ctx.fillText(labels[0], transformX(0) + 8, transformY(-this.R) + fontSize / 3.6)
    this.ctx.fillText(labels[1], transformX(0) + 8, transformY(-this.R / 2) + fontSize / 3.6)
    this.ctx.fillText(labels[2], transformX(0) + 8, transformY(this.R / 2) + fontSize / 3.6)
    this.ctx.fillText(labels[3], transformX(0) + 8, transformY(this.R) + fontSize / 3.6)
    this.ctx.fillText('y', transformX(0) + 8, transformY(this.R + 32) + fontSize / 3.6)

    // points
    this.shots.forEach(shot => {
      if (shot.r == this.getLastSelectedR())
        this.drawPoint(shot.x, shot.y, shot.r, shot.inArea)
    })
  }

  drawPoint(x: number, y: number, r: number, inArea: boolean) {
    x = x * this.scale / (r / this.R) + this.canvas.width / 2
    y = -y * this.scale / (r / this.R) + this.canvas.width / 2
    this.ctx.beginPath()
    this.ctx.arc(x, y, 3, 0, 2 * Math.PI, false)
    this.ctx.fillStyle = inArea ? "yellow" : "grey"
    this.ctx.fill()
  }
}
