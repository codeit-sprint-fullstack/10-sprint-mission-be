import { Router } from 'express';
import * as controller from '../controllers/productsController.js';

const router = Router();

router.post('/', controller.createProduct);
router.get('/', controller.listProducts);
router.get('/:id', controller.getProductById);
router.patch('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

export default router;


