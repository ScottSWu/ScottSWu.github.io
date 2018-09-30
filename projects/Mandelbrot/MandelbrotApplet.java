import java.applet.Applet;
import java.awt.Canvas;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.Scanner;

import javax.imageio.ImageIO;
import javax.swing.JFrame;


public class MandelbrotApplet extends Applet implements MouseListener,MouseMotionListener,MouseWheelListener {
	public int maxiterations = 1000;
	public double	xmin = -3,
					xmax = 1,
					ymin = -1.25,
					ymax = 1.25;
	private BufferedImage generatedImage;
	
	public void init() {
		this.addMouseListener(this);
		this.addMouseMotionListener(this);
		this.addMouseWheelListener(this);
		
		createMandelbrot();
	}
	
	public void createMandelbrot() {
		Dimension size = this.getSize();
		generatedImage = new BufferedImage(size.width,size.height,BufferedImage.TYPE_4BYTE_ABGR);
		
		double sx,sy;
		double x,y,t;
		int vertical;
		int iteration;
		int color;
		int[] pixels = new int[size.width*size.height];
		float[][] iterations = new float[size.height][size.width];
		int skip = 3;
		
		// For each pixel
		for (int i=0; i<size.width; i+=skip) {
			for (int j=0; j<size.height; j+=skip) {
				// Scale pixel coordinates
				sx = ((double) i/size.width)*(xmax-xmin)+xmin;
				sy = ((double) j/size.height)*(ymax-ymin)+ymin;
				
				x = 0;
				y = 0;
				
				iteration = 0;
				
				while (x*x + y*y<4 && iteration<maxiterations) {
					t = x*x - y*y + sx;
					y = 2*x*y + sy;
					x = t;
					iteration++;
				}
				
				iterations[j][i] = iteration/100f;
				
				color = HSBtoRGB(iterations[j][i]);
				
				vertical = j*size.width;
				pixels[vertical + i] = color;
				if (skip==2) {
					try { pixels[vertical + i-1] = HSBtoRGB((iterations[j][i-2] + iteration)/2); } catch (Exception e) { ; }
					try { pixels[vertical + i-size.width] = HSBtoRGB((iterations[j-2][i] + iteration)/2); } catch (Exception e) { ; }
					try { pixels[vertical + i-1-size.width] = HSBtoRGB((iterations[j-2][i] + iterations[j][i-2] + iterations[j-2][i-2] + iteration)/4); } catch (Exception e) { ; }
				}
				else if (skip==3) {
					try { // Horizontal
						pixels[vertical + i-2] = HSBtoRGB(iterations[j][i-3]*0.66f+iterations[j][i]*0.33f);
						pixels[vertical + i-1] = HSBtoRGB(iterations[j][i-3]*0.33f+iterations[j][i]*0.66f);
					} catch (Exception e) { ; }
					try { // Vertical
						pixels[vertical + i-size.width*2] =	HSBtoRGB(iterations[j-3][i]*0.66f+iterations[j][i]*0.33f);
						pixels[vertical + i-size.width] =	HSBtoRGB(iterations[j-3][i]*0.33f+iterations[j][i]*0.66f);
					} catch (Exception e) { ; }

					try { // Center
						pixels[vertical + i-2-size.width*2] =	HSBtoRGB(iterations[j-3][i-3]*0.40f+iterations[j-3][i]*0.25f+iterations[j][i-3]*0.25f+iterations[j][i]*0.10f);
						pixels[vertical + i-1-size.width*2] =	HSBtoRGB(iterations[j-3][i-3]*0.25f+iterations[j-3][i]*0.40f+iterations[j][i-3]*0.10f+iterations[j][i]*0.25f);
						pixels[vertical + i-2-size.width] =		HSBtoRGB(iterations[j-3][i-3]*0.25f+iterations[j-3][i]*0.10f+iterations[j][i-3]*0.40f+iterations[j][i]*0.25f);
						pixels[vertical + i-1-size.width] =		HSBtoRGB(iterations[j-3][i-3]*0.10f+iterations[j-3][i]*0.25f+iterations[j][i-3]*0.25f+iterations[j][i]*0.40f);
					} catch (Exception e) { ; }
				}
			}
		}
		
		generatedImage.setRGB(0,0,size.width,size.height,pixels,0,size.width);
		repaint();
	}
	
	public int HSBtoRGB(float hue) {
        int r = 0, g = 0, b = 0;
        float h = (hue - (int) hue) * 6.0f;
        float f = h - (int) h;
        float q = 1.0f - f;
        float t = f;
        switch ((int) h) {
        case 0:
            r = 255;
            g = (int) (t * 255.0f + 0.5f);
            b = 0;
            break;
        case 1:
            r = (int) (q * 255.0f + 0.5f);
            g = 255;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 255;
            b = (int) (t * 255.0f + 0.5f);
            break;
        case 3:
            r = 0;
            g = (int) (q * 255.0f + 0.5f);
            b = 255;
            break;
        case 4:
            r = (int) (t * 255.0f + 0.5f);
            g = 0;
            b = 255;
            break;
        case 5:
            r = 255;
            g = 0;
            b = (int) (q * 255.0f + 0.5f);
            break;
        }
        return 0xff000000 | (r << 16) | (g << 8) | (b << 0);
    }
	
	public void paint(Graphics g) {
		if (generatedImage==null || this.getWidth()!=generatedImage.getWidth() || this.getHeight()!=generatedImage.getHeight()) {
			createMandelbrot();
		}
		g.drawImage(generatedImage,0,0,null);
	}
	
	private int mouseX,mouseY;

	@Override
	public void mouseWheelMoved(MouseWheelEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
		int rot = e.getWheelRotation();
		double change = Math.pow(2.0/3.0,rot);
		double cx = ((double) mouseX/this.getWidth())*(xmax-xmin) + xmin;
		double cy = ((double) mouseY/this.getHeight())*(ymax-ymin) + ymin;
		double diffx = (xmax-xmin)*change/2.0;
		double diffy = (ymax-ymin)*change/2.0;
		xmin = cx-diffx;
		xmax = cx+diffx;
		ymin = cy-diffy;
		ymax = cy+diffy;
		createMandelbrot();
	}

	@Override
	public void mouseClicked(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
		double cx = ((double) mouseX/this.getWidth())*(xmax-xmin) + xmin;
		double cy = ((double) mouseY/this.getHeight())*(ymax-ymin) + ymin;
		double diffx = (xmax-xmin)/2.0;
		double diffy = (ymax-ymin)/2.0;
		xmin = cx-diffx;
		xmax = cx+diffx;
		ymin = cy-diffy;
		ymax = cy+diffy;
		createMandelbrot();
	}

	@Override
	public void mousePressed(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
	}

	@Override
	public void mouseReleased(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
	}

	@Override
	public void mouseEntered(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
	}

	@Override
	public void mouseExited(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
	}

	@Override
	public void mouseDragged(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
	}

	@Override
	public void mouseMoved(MouseEvent e) {
		mouseX = e.getX();
		mouseY = e.getY();
	}
}
