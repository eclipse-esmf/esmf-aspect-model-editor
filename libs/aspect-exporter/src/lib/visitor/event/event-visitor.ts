import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {MxGraphHelper} from '@bame/mx-graph';
import {ListProperties, RdfListService, RdfNodeService} from '@bame/aspect-exporter';
import {DefaultEvent} from '@bame/meta-model';
import {RdfService} from '@bame/rdf/services';

@Injectable()
export class EventVisitor extends BaseVisitor<DefaultEvent> {
    private get store(): Store {
        return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
    }

    constructor(private rdfNodeService: RdfNodeService, rdfService: RdfService, public rdfListService: RdfListService) {
        super(rdfService);
    }

    visit(cell: mxgraph.mxCell): DefaultEvent {
        const event: DefaultEvent = MxGraphHelper.getModelElement<DefaultEvent>(cell);
        this.setPrefix(event.aspectModelUrn);
        const oldAspectModelUrn = event.aspectModelUrn;
        this.addProperties(event);
        if (oldAspectModelUrn !== event.aspectModelUrn) {
            this.removeOldQuads(oldAspectModelUrn);
        }
        return event;
    }

    private addProperties(event: DefaultEvent) {
        this.rdfNodeService.update(event, {
            preferredName: event.getAllLocalesPreferredNames().map(language => ({
                language,
                value: event.getPreferredName(language),
            })),
            description: event.getAllLocalesDescriptions().map(language => ({
                language,
                value: event.getDescription(language),
            })),
            see: event.getSeeReferences() || [],
            name: event.name,
        });

        if (event.parameters?.length) {
            this.rdfListService.push(event, ...event.parameters);
            for (const param of event.parameters) {
                this.setPrefix(param.property.aspectModelUrn);
            }
        } else {
            this.rdfListService.createEmpty(event, ListProperties.parameters);
        }
    }

    private removeOldQuads(oldAspectModelUrn: string) {
        this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
    }
}
