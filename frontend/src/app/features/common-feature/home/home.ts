import { Component } from '@angular/core';
import { AdminRoutingModule } from "../../admin/admin-routing-module";

@Component({
  selector: 'app-home',
  imports: [AdminRoutingModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
